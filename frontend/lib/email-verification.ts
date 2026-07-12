import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { getAppBaseUrl } from "@/lib/app-url"
import { isEmailConfigured, sendEmailInBackground } from "@/lib/email/send"
import { sendEmailVerificationEmail } from "@/lib/email/messages"

const VERIFY_PREFIX = "email-verify:"
const VERIFY_TTL_MS = 48 * 60 * 60 * 1000 // 48 hours

export function emailVerifyIdentifier(email: string): string {
  return `${VERIFY_PREFIX}${email.toLowerCase().trim()}`
}

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

  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + VERIFY_TTL_MS)
  const identifier = emailVerifyIdentifier(email)

  await prisma.verificationToken.deleteMany({ where: { identifier } })
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
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
      await prisma.verificationToken
        .deleteMany({ where: { identifier, token } })
        .catch(() => {})
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
): Promise<{ ok: true; userId: string } | { ok: false; reason: "invalid" | "already_verified" }> {
  const email = emailInput.toLowerCase().trim()
  const identifier = emailVerifyIdentifier(email)

  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token },
  })

  if (!record || record.expires < new Date()) {
    return { ok: false, reason: "invalid" }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  })

  if (!user) {
    return { ok: false, reason: "invalid" }
  }

  if (user.emailVerified) {
    await prisma.verificationToken.deleteMany({ where: { identifier } })
    return { ok: false, reason: "already_verified" }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.deleteMany({ where: { identifier } }),
  ])

  return { ok: true, userId: user.id }
}

export async function markUserEmailVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, emailVerified: true },
  })
  if (!user) return false
  if (user.emailVerified) return true

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  })
  await prisma.verificationToken.deleteMany({
    where: { identifier: emailVerifyIdentifier(user.email) },
  })
  return true
}
