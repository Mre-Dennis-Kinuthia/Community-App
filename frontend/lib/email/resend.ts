import type { SendEmailResult } from "./send"
import { getEmailFrom } from "./config"

import type { EmailAttachment } from "./send"

export async function sendResendEmail(params: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  cc?: string | string[]
  attachments?: EmailAttachment[]
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = getEmailFrom()

  if (!apiKey) {
    console.warn("[EMAIL] RESEND_API_KEY not set — email not sent:", params.subject)
    return { ok: false, error: "Email service not configured" }
  }

  const to = Array.isArray(params.to) ? params.to : [params.to]
  const cc = params.cc
    ? Array.isArray(params.cc)
      ? params.cc
      : [params.cc]
    : undefined

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      ...(cc && cc.length > 0 ? { cc } : {}),
      subject: params.subject,
      html: params.html,
      text: params.text,
      reply_to: params.replyTo,
      attachments: (params.attachments ?? []).map((file) => ({
        filename: file.filename,
        content: Buffer.from(file.content, "utf8").toString("base64"),
        content_type: file.contentType ?? "application/octet-stream",
      })),
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    console.error("[EMAIL] Resend error:", res.status, body)
    return { ok: false, error: "Failed to send email" }
  }

  try {
    const data = (await res.json()) as { id?: string }
    return { ok: true, id: data.id }
  } catch {
    return { ok: true }
  }
}
