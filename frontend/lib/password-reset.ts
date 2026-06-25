import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import { getAppBaseUrl } from "@/lib/app-url"
import { isEmailConfigured } from "@/lib/email/send"
import type { SendEmailResult } from "@/lib/email/send"

const RESET_TTL_MS = 60 * 60 * 1000

export type IssuePasswordResetResult =
  | { ok: true; emailed: true; email: string; resetUrl: string }
  | { ok: true; emailed: false; email: string; reason: "google_only" | "email_not_configured" }
  | { ok: false; reason: "user_not_found" }

function buildResetUrl(baseUrl: string, email: string, token: string): string {
  const root = baseUrl.replace(/\/$/, "")
  return `${root}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
}

export async function issuePasswordResetForEmail(
  emailInput: string,
  options?: {
    baseUrl?: string
    initiatedByAdmin?: boolean
  }
): Promise<IssuePasswordResetResult> {
  const email = emailInput.toLowerCase().trim()
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true, name: true },
  })

  if (!user) {
    return { ok: false, reason: "user_not_found" }
  }

  if (!user.password) {
    return { ok: true, emailed: false, email: user.email, reason: "google_only" }
  }

  if (!isEmailConfigured()) {
    return { ok: true, emailed: false, email: user.email, reason: "email_not_configured" }
  }

  const token = randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + RESET_TTL_MS)

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  })

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  const baseUrl = options?.baseUrl || getAppBaseUrl()
  const resetUrl = buildResetUrl(baseUrl, email, token)

  const emailResult: SendEmailResult = await sendPasswordResetEmail({
    to: email,
    resetUrl,
    initiatedByAdmin: options?.initiatedByAdmin,
    name: user.name,
  })

  if (!emailResult.ok) {
    console.error("[PASSWORD RESET] Email not sent:", emailResult.error)
    return { ok: true, emailed: false, email: user.email, reason: "email_not_configured" }
  }

  return { ok: true, emailed: true, email: user.email, resetUrl }
}
