import { randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import { getAppBaseUrl } from "@/lib/app-url"
import { isEmailConfigured, sendEmailInBackground } from "@/lib/email/send"
import { ensureMemberUserForAdmin } from "@/lib/admin-member-access"

const RESET_TTL_MS = 60 * 60 * 1000

export type IssuePasswordResetResult =
  | { ok: true; emailed: true; email: string; resetUrl: string }
  | {
      ok: true
      emailed: false
      email: string
      reason: "email_not_configured" | "email_send_failed"
    }
  | { ok: false; reason: "user_not_found" }

function buildResetUrl(baseUrl: string, email: string, token: string): string {
  const root = baseUrl.replace(/\/$/, "")
  return `${root}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
}

async function resolveUserForPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true, name: true },
  })

  if (user) {
    return user
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, password: true },
  })

  if (!admin?.password) {
    return null
  }

  try {
    const linked = await ensureMemberUserForAdmin(admin)
    return {
      id: linked.id,
      email: linked.email,
      password: linked.password,
      name: linked.name,
    }
  } catch {
    return null
  }
}

export async function issuePasswordResetForEmail(
  emailInput: string,
  options?: {
    baseUrl?: string
    initiatedByAdmin?: boolean
  }
): Promise<IssuePasswordResetResult> {
  const email = emailInput.toLowerCase().trim()
  const user = await resolveUserForPasswordReset(email)

  if (!user) {
    return { ok: false, reason: "user_not_found" }
  }

  if (!isEmailConfigured()) {
    console.error("[PASSWORD RESET] Email provider not configured")
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

  sendEmailInBackground(async () => {
    const result = await sendPasswordResetEmail({
      to: email,
      resetUrl,
      initiatedByAdmin: options?.initiatedByAdmin,
      name: user.name,
    })

    if (!result.ok) {
      console.error("[PASSWORD RESET] Email not sent:", result.error)
      await prisma.verificationToken
        .delete({
          where: {
            identifier_token: { identifier: email, token },
          },
        })
        .catch((error) => {
          console.error("[PASSWORD RESET] Failed to roll back token:", error)
        })
    }

    return result
  }, "password-reset")

  return { ok: true, emailed: true, email: user.email, resetUrl }
}

export async function issuePasswordResetForMemberId(
  memberId: string,
  options?: { initiatedByAdmin?: boolean }
): Promise<IssuePasswordResetResult & { memberId?: string }> {
  const member = await prisma.user.findUnique({
    where: { id: memberId },
    select: { id: true, email: true },
  })

  if (!member) {
    return { ok: false, reason: "user_not_found" }
  }

  const result = await issuePasswordResetForEmail(member.email, {
    initiatedByAdmin: options?.initiatedByAdmin ?? true,
  })

  return { ...result, memberId: member.id }
}
