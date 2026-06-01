import nodemailer from "nodemailer"
import type { SendEmailResult } from "./send"
import { getEmailFrom } from "./config"

function createTransport() {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()

  if (!host || !user || !pass) {
    return null
  }

  const port = parseInt(process.env.SMTP_PORT || "587", 10)
  const secure = process.env.SMTP_SECURE === "true" || port === 465

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

export async function sendSmtpEmail(params: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}): Promise<SendEmailResult> {
  const transport = createTransport()
  if (!transport) {
    console.warn("[EMAIL] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)")
    return { ok: false, error: "SMTP not configured" }
  }

  const to = Array.isArray(params.to) ? params.to : [params.to]

  try {
    const info = await transport.sendMail({
      from: getEmailFrom(),
      to: to.join(", "),
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
    })
    return { ok: true, id: info.messageId }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[EMAIL] SMTP error:", message)
    return { ok: false, error: message || "Failed to send email" }
  }
}
