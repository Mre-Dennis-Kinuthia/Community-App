import type { SendEmailResult } from "./send"
import { getEmailFromParts } from "./config"
import { createSmtpTransport, getLastSmtpSetupError } from "./smtp-transport"

export {
  isSmtpConfigured,
  isGoogleOAuthSmtpConfigured,
  isSmtpPasswordConfigured,
  getSmtpTransportLabel,
  isDisallowedSmtpHost,
} from "./smtp-transport"

import type { EmailAttachment } from "./send"

export async function sendSmtpEmail(params: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  cc?: string | string[]
  attachments?: EmailAttachment[]
}): Promise<SendEmailResult> {
  const transport = await createSmtpTransport()
  if (!transport) {
    const setupError = getLastSmtpSetupError()
    if (setupError) {
      return { ok: false, error: setupError }
    }
    console.warn(
      "[EMAIL] SMTP not configured — set SMTP_PASS (App Password) or GOOGLE_REFRESH_TOKEN (OAuth)"
    )
    return { ok: false, error: "SMTP not configured" }
  }

  const to = Array.isArray(params.to) ? params.to : [params.to]
  const cc = params.cc
    ? Array.isArray(params.cc)
      ? params.cc
      : [params.cc]
    : []

  try {
    const attachments = (params.attachments ?? []).map((file) => {
      const isInline = Boolean(file.contentId) && file.inline !== false
      const content =
        file.encoding === "base64"
          ? Buffer.from(file.content, "base64")
          : Buffer.isBuffer(file.content)
            ? file.content
            : Buffer.from(String(file.content), "utf8")

      // Nodemailer: set `cid` for multipart/related inline images referenced as cid:…
      // Keep the shape minimal — extra fields can confuse Gmail SMTP rewriting.
      if (isInline && file.contentId) {
        return {
          filename: file.filename,
          content,
          contentType: file.contentType ?? "image/png",
          cid: file.contentId,
          contentDisposition: "inline" as const,
        }
      }

      return {
        filename: file.filename,
        content,
        contentType: file.contentType ?? "application/octet-stream",
      }
    })

    if (attachments.some((a) => "cid" in a)) {
      console.log(
        "[EMAIL] Inline attachments:",
        attachments.filter((a) => "cid" in a).map((a) => `${a.filename} cid=${(a as { cid?: string }).cid}`)
      )
    }

    const info = await transport.sendMail({
      from: getEmailFromParts(),
      to: to.join(", "),
      cc: cc.length > 0 ? cc.join(", ") : undefined,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
      attachments,
    })
    return { ok: true, id: info.messageId }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[EMAIL] SMTP error:", message)
    return { ok: false, error: message || "Failed to send email" }
  }
}
