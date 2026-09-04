import { prisma } from "@/lib/prisma"

export async function subscribeNewsletterEmail(params: {
  email: string
  source?: string
}): Promise<"created" | "reactivated" | "already_subscribed"> {
  const email = params.email.toLowerCase().trim()
  const source = params.source ?? "landing"

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  })

  if (!existing) {
    await prisma.newsletterSubscriber.create({
      data: { email, source },
    })
    return "created"
  }

  if (existing.unsubscribedAt) {
    await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        unsubscribedAt: null,
        subscribedAt: new Date(),
        source,
      },
    })
    return "reactivated"
  }

  return "already_subscribed"
}

/**
 * Add a community member to the newsletter list.
 * Does not reactivate someone who already unsubscribed.
 */
export async function subscribeMemberToNewsletter(
  email: string | null | undefined
): Promise<"created" | "already_subscribed" | "opted_out" | "skipped"> {
  if (!email?.trim()) return "skipped"
  const normalized = email.toLowerCase().trim()

  try {
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
