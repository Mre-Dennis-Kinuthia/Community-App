import { sendResendEmail } from "./resend"
import { sendSmtpEmail } from "./smtp"
import { isSmtpConfigured } from "./smtp-transport"

export type SendEmailResult = { ok: true; id?: string } | { ok: false; error: string }

export type EmailProvider = "smtp" | "resend"

export { getEmailFrom, getEmailStaffTo } from "./config"

/** Which backend is active (SMTP preferred when both are set). */
export function getEmailProvider(): EmailProvider | null {
  const forced = process.env.EMAIL_PROVIDER?.trim().toLowerCase()
  if (forced === "smtp") {
    return isSmtpConfigured() ? "smtp" : null
  }
  if (forced === "resend") {
    return process.env.RESEND_API_KEY?.trim() ? "resend" : null
  }
  if (isSmtpConfigured()) {
    return "smtp"
  }
  if (process.env.RESEND_API_KEY?.trim()) {
    return "resend"
  }
  return null
}

export function isEmailConfigured(): boolean {
  return getEmailProvider() !== null
}

export async function sendEmail(params: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}): Promise<SendEmailResult> {
  const provider = getEmailProvider()
  if (!provider) {
    console.warn("[EMAIL] No email provider configured — not sent:", params.subject)
    return { ok: false, error: "Email service not configured" }
  }

  if (provider === "smtp") {
    return sendSmtpEmail(params)
  }
  return sendResendEmail(params)
}

export function sendEmailInBackground(promise: Promise<SendEmailResult>, context: string) {
  promise.then((result) => {
    if (!result.ok) {
      console.warn(`[EMAIL] ${context}:`, result.error)
    }
  })
}
