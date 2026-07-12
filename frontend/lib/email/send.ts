import { after } from "next/server"
import { normalizeEmailAddress, resolveEmailCc } from "./cc"
import { getEmailFrom } from "./config"
import { sendResendEmail } from "./resend"
import { sendSmtpEmail } from "./smtp"
import {
  getSmtpTransportLabel,
  isGoogleOAuthSmtpConfigured,
  isSmtpConfigured,
} from "./smtp-transport"

export type SendEmailResult = { ok: true; id?: string } | { ok: false; error: string }

export type EmailAttachment = {
  filename: string
  content: string
  contentType?: string
}

export type EmailProvider = "smtp" | "resend"

export type EmailTask = () => Promise<SendEmailResult>

export { getEmailFrom, getEmailStaffTo } from "./config"
export { getConfiguredEmailCc, resolveEmailCc } from "./cc"

/**
 * Active mail backend. Production uses Gmail via Google OAuth (see GOOGLE_WORKSPACE_EMAIL.md).
 * Brevo/Sendinblue SMTP hosts are ignored even if present in env.
 */
export function getEmailProvider(): EmailProvider | null {
  const forced = process.env.EMAIL_PROVIDER?.trim().toLowerCase()

  if (forced === "resend") {
    return process.env.RESEND_API_KEY?.trim() ? "resend" : null
  }

  if (isSmtpConfigured()) {
    return "smtp"
  }

  if (forced === "smtp") {
    return null
  }

  if (process.env.RESEND_API_KEY?.trim()) {
    return "resend"
  }
  return null
}

export function getEmailProviderLabel(): string | null {
  const provider = getEmailProvider()
  if (provider === "resend") return "Resend"
  if (provider === "smtp") return getSmtpTransportLabel() ?? "SMTP"
  if (isGoogleOAuthSmtpConfigured()) return "Gmail (Google OAuth)"
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
  cc?: string | string[]
  /** When true, skip the admin-configured CC list (explicit `cc` still applies). */
  skipConfiguredCc?: boolean
  attachments?: EmailAttachment[]
}): Promise<SendEmailResult> {
  const provider = getEmailProvider()
  if (!provider) {
    console.warn("[EMAIL] No email provider configured — not sent:", params.subject)
    return { ok: false, error: "Email service not configured" }
  }

  const from = getEmailFrom()
  const cc = await resolveEmailCc({
    to: params.to,
    cc: params.cc,
    skipConfiguredCc: params.skipConfiguredCc,
    fromEmail: normalizeEmailAddress(from),
  })

  const payload = {
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    replyTo: params.replyTo,
    cc,
    attachments: params.attachments,
  }

  if (provider === "smtp") {
    return sendSmtpEmail(payload)
  }
  return sendResendEmail(payload)
}

function logEmailResult(context: string, result: SendEmailResult) {
  if (!result.ok) {
    console.error(`[EMAIL] ${context} failed:`, result.error)
  } else {
    console.log(`[EMAIL] ${context} sent`, result.id ? `(id: ${result.id})` : "")
  }
}

/** Run email after the HTTP response (required on Vercel so sends are not cut off). */
export function sendEmailInBackground(send: EmailTask, context: string) {
  const run = async () => {
    const result = await send()
    logEmailResult(context, result)
  }

  try {
    after(run)
  } catch {
    void run()
  }
}

/** Send multiple emails in one after() callback (e.g. news broadcast). */
export function sendEmailsInBackground(tasks: Array<{ send: EmailTask; context: string }>) {
  if (tasks.length === 0) return

  const run = async () => {
    for (const { send, context } of tasks) {
      const result = await send()
      logEmailResult(context, result)
    }
  }

  try {
    after(run)
  } catch {
    void run()
  }
}
