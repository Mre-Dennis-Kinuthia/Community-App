import type { SendEmailResult } from "./send"
import { getEmailFrom } from "./config"
import { createSmtpTransport, isSmtpConfigured } from "./smtp-transport"

export {
  isSmtpConfigured,
  isGoogleOAuthSmtpConfigured,
  isSmtpPasswordConfigured,
  getSmtpTransportLabel,
  isDisallowedSmtpHost,
} from "./smtp-transport"

export async function sendSmtpEmail(params: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}): Promise<SendEmailResult> {
  const transport = createSmtpTransport()
  if (!transport) {
    console.warn(
      "[EMAIL] SMTP not configured — set SMTP_PASS (App Password) or GOOGLE_REFRESH_TOKEN (OAuth)"
    )
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
