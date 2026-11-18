import { prisma } from "@/lib/prisma"
import {
  issueEmailActionToken,
  hashEmailActionToken,
} from "@/lib/email-action-tokens"
import { getAppBaseUrl } from "@/lib/app-url"
import { isEmailConfigured, sendEmailInBackground } from "@/lib/email/send"
import {
  sendNewsletterConfirmationEmail,
  sendNewsletterSubscribeEmail,
  sendNewsletterSubscribeStaffEmail,
} from "@/lib/email/messages"

const NEWSLETTER_CONFIRM_PURPOSE = "newsletter-subscription-confirmation"
const NEWSLETTER_CONFIRM_TTL_MS = 24 * 60 * 60 * 1000

export async function requestNewsletterSubscription(params: {
  email: string
  source?: string
}): Promise<void> {
  const email = params.email.toLowerCase().trim()
  const source = params.source ?? "landing"
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  })

  if (subscriber?.confirmedAt && !subscriber.unsubscribedAt) return

  const updatedSubscriber = subscriber
    ? await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data: {
          confirmedAt: null,
          subscribedAt: new Date(),
          source,
        },
        select: { id: true },
      })
    : await prisma.newsletterSubscriber.create({
        data: { email, source },
        select: { id: true },
      })

  if (!isEmailConfigured()) {
    throw new Error("Email provider is not configured for newsletter confirmation")
  }

  const { token } = await issueEmailActionToken({
    purpose: NEWSLETTER_CONFIRM_PURPOSE,
    subjectId: updatedSubscriber.id,
    expiresAt: new Date(Date.now() + NEWSLETTER_CONFIRM_TTL_MS),
  })

  const confirmUrl = `${getAppBaseUrl().replace(/\/$/, "")}/newsletter/confirm?token=${encodeURIComponent(token)}`
  sendEmailInBackground(
    async () => {
      const result = await sendNewsletterConfirmationEmail({ to: email, confirmUrl })
      if (!result.ok) {
        await prisma.emailActionToken.deleteMany({
          where: {
            purpose: NEWSLETTER_CONFIRM_PURPOSE,
            subjectId: updatedSubscriber.id,
            tokenHash: hashEmailActionToken(token),
          },
        })
      }
      return result
    },
    "newsletter-confirmation"
  )
}

export async function confirmNewsletterSubscription(
  token: string
): Promise<"confirmed" | "invalid" | "already_confirmed"> {
  const tokenHash = hashEmailActionToken(token)
  const now = new Date()
  const result = await prisma.$transaction(async (tx) => {
    const action = await tx.emailActionToken.findFirst({
      where: {
        purpose: NEWSLETTER_CONFIRM_PURPOSE,
        tokenHash,
        expiresAt: { gt: now },
      },
      select: { id: true, subjectId: true, createdAt: true },
    })

    if (!action) return { status: "invalid" as const }

    const subscriber = await tx.newsletterSubscriber.findUnique({
      where: { id: action.subjectId },
      select: {
        id: true,
        email: true,
        unsubscribeToken: true,
        confirmedAt: true,
        unsubscribedAt: true,
      },
    })
    if (
      !subscriber ||
      (subscriber.unsubscribedAt &&
        subscriber.unsubscribedAt >= action.createdAt)
    ) {
      await tx.emailActionToken.delete({ where: { id: action.id } })
      return { status: "invalid" as const }
    }

    if (subscriber.confirmedAt) {
      await tx.emailActionToken.delete({ where: { id: action.id } })
      return { status: "already_confirmed" as const }
    }

    const consumed = await tx.emailActionToken.deleteMany({
      where: { id: action.id, tokenHash, expiresAt: { gt: now } },
    })
    if (consumed.count !== 1) return { status: "invalid" as const }

    await tx.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { confirmedAt: now, unsubscribedAt: null },
    })
    return { status: "confirmed" as const, subscriber }
  })

  if (result.status === "confirmed") {
    sendEmailInBackground(
      () =>
        sendNewsletterSubscribeEmail({
          to: result.subscriber.email,
          unsubscribeToken: result.subscriber.unsubscribeToken,
        }),
      "newsletter-subscribe"
    )
    sendEmailInBackground(
      () => sendNewsletterSubscribeStaffEmail({ email: result.subscriber.email }),
      "newsletter-subscribe-staff"
    )
  }

  return result.status
}

export async function subscribeMemberToNewsletter(
  email: string | null | undefined
): Promise<"created" | "already_subscribed" | "opted_out" | "skipped"> {
  if (!email?.trim()) return "skipped"
  const normalized = email.toLowerCase().trim()

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { emailVerified: true },
    })
    if (!user?.emailVerified) return "skipped"

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalized },
      select: { unsubscribedAt: true },
    })
    if (existing) {
      return existing.unsubscribedAt ? "opted_out" : "already_subscribed"
    }

    await prisma.newsletterSubscriber.create({
      data: { email: normalized, source: "member" },
    })
    return "created"
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code)
        : ""
    if (code === "P2002") return "already_subscribed"
    console.error("[newsletter] Failed to subscribe member:", error)
    return "skipped"
  }
}

/** Idempotent: add every member email that is not already on the list. */
export async function subscribeAllMembersToNewsletter(): Promise<{
  created: number
  already: number
}> {
  const users = await prisma.user.findMany({
    select: { email: true },
  })
  const emails = [
    ...new Set(
      users
        .map((user) => user.email?.toLowerCase().trim())
        .filter((email): email is string => Boolean(email))
    ),
  ]
  if (emails.length === 0) return { created: 0, already: 0 }

  const existing = await prisma.newsletterSubscriber.findMany({
    where: { email: { in: emails } },
    select: { email: true },
  })
  const existingSet = new Set(existing.map((row) => row.email.toLowerCase()))
  const toCreate = emails.filter((email) => !existingSet.has(email))

  if (toCreate.length > 0) {
    const chunkSize = 500
    for (let i = 0; i < toCreate.length; i += chunkSize) {
      const chunk = toCreate.slice(i, i + chunkSize)
      await prisma.newsletterSubscriber.createMany({
        data: chunk.map((email) => ({ email, source: "member" })),
        skipDuplicates: true,
      })
    }
  }

  return { created: toCreate.length, already: emails.length - toCreate.length }
}

export async function unsubscribeNewsletterByToken(
  token: string
): Promise<"unsubscribed" | "not_found" | "already_unsubscribed"> {
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
  })

  if (!subscriber) return "not_found"
  if (subscriber.unsubscribedAt) return "already_unsubscribed"

  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { unsubscribedAt: new Date() },
  })

  return "unsubscribed"
}
