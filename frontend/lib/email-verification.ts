import { prisma } from "@/lib/prisma"
import {
  hashEmailActionToken,
  issueEmailActionToken,
} from "@/lib/email-action-tokens"
import { getAppBaseUrl } from "@/lib/app-url"
import { isEmailConfigured, sendEmailInBackground } from "@/lib/email/send"
import { sendEmailVerificationEmail } from "@/lib/email/messages"
import { activateVerifiedRegistration } from "@/lib/registration-activation"

const VERIFY_PURPOSE = "member-email-verification"
const VERIFY_TTL_MS = 60 * 60 * 1000

export function buildEmailVerifyUrl(email: string, token: string, baseUrl?: string): string {
  const root = (baseUrl || getAppBaseUrl()).replace(/\/$/, "")
  return `${root}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
}

export type IssueEmailVerificationResult =
  | { ok: true; emailed: true; email: string; verifyUrl: string }
  | {
      ok: true
      emailed: false
      email: string
      reason: "email_not_configured" | "email_send_failed" | "already_verified"
    }
  | { ok: false; reason: "user_not_found" }

export async function issueEmailVerificationForEmail(
  emailInput: string,
  options?: { baseUrl?: string; name?: string | null }
): Promise<IssueEmailVerificationResult> {
  const email = emailInput.toLowerCase().trim()
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, emailVerified: true },
  })

  if (!user) {
    return { ok: false, reason: "user_not_found" }
  }

  if (user.emailVerified) {
    return { ok: true, emailed: false, email: user.email, reason: "already_verified" }
  }

  if (!isEmailConfigured()) {
    console.error("[EMAIL VERIFY] Email provider not configured")
    return { ok: true, emailed: false, email: user.email, reason: "email_not_configured" }
  }

  const { token } = await issueEmailActionToken({
    purpose: VERIFY_PURPOSE,
    subjectId: user.id,
    expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
  })
  const verifyUrl = buildEmailVerifyUrl(email, token, options?.baseUrl)

  sendEmailInBackground(async () => {
    const result = await sendEmailVerificationEmail({
      to: email,
      verifyUrl,
      name: options?.name ?? user.name,
    })
    if (!result.ok) {
      console.error("[EMAIL VERIFY] Email not sent:", result.error)
      await prisma.emailActionToken.deleteMany({
        where: {
          purpose: VERIFY_PURPOSE,
          subjectId: user.id,
          tokenHash: hashEmailActionToken(token),
        },
      })
    }
    return result
  }, "email-verification")

  return { ok: true, emailed: true, email: user.email, verifyUrl }
}

export async function issueEmailVerificationForUserId(
  userId: string,
  options?: { baseUrl?: string }
): Promise<IssueEmailVerificationResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  })
  if (!user) return { ok: false, reason: "user_not_found" }
  return issueEmailVerificationForEmail(user.email, {
    baseUrl: options?.baseUrl,
    name: user.name,
  })
}

export async function consumeEmailVerificationToken(
  emailInput: string,
  token: string
): Promise<
  | { ok: true; userId: string }
  | { ok: false; reason: "invalid" | "already_verified" }
> {
  const email = emailInput.toLowerCase().trim()
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (!user) return { ok: false, reason: "invalid" }

  const now = new Date()
  const result = await prisma.$transaction(async (tx) => {
    const consumed = await tx.emailActionToken.deleteMany({
      where: {
        purpose: VERIFY_PURPOSE,
        subjectId: user.id,
        tokenHash: hashEmailActionToken(token),
        expiresAt: { gt: now },
      },
    })

    if (consumed.count !== 1) return "invalid" as const

    const currentUser = await tx.user.findUnique({
      where: { id: user.id },
      select: { emailVerified: true },
    })
    if (!currentUser) return "invalid" as const
    if (currentUser.emailVerified) return "already_verified" as const

    const updated = await tx.user.updateMany({
      where: { id: user.id, emailVerified: null },
      data: { emailVerified: now },
    })
    return updated.count === 1 ? ("verified" as const) : ("invalid" as const)
  })

  if (result === "invalid") return { ok: false, reason: "invalid" }

  await activateVerifiedRegistration(user.id)
  if (result === "already_verified") {
    return { ok: false, reason: "already_verified" }
  }

  return { ok: true, userId: user.id }
}

export async function markUserEmailVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, emailVerified: true },
  })
  if (!user) return false
  if (user.emailVerified) {
    await prisma.emailActionToken.deleteMany({
      where: { purpose: VERIFY_PURPOSE, subjectId: user.id },
    })
    await activateVerifiedRegistration(user.id)
    return true
  }

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  })
  await prisma.emailActionToken.deleteMany({
    where: { purpose: VERIFY_PURPOSE, subjectId: userId },
  })
  await activateVerifiedRegistration(userId)
  return true
}
