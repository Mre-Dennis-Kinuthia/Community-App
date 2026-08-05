/**
 * Send a branded test email (verifies inline logo attachment).
 * Run: npx tsx --env-file=.env.local scripts/test-smtp.ts [recipient@email.com]
 */
import { getEmailFrom, getEmailFromParts } from "../lib/email/config"
import { layoutEmail } from "../lib/email/templates"
import { mergeEmailAttachments, hasEmbeddedEmailLogo } from "../lib/email/brand-assets"
import { createSmtpTransport, isSmtpConfigured } from "../lib/email/smtp-transport"

const to = process.argv[2] || process.env.EMAIL_STAFF_TO || "dennis.ndungu@impacthub.net"

async function main() {
  const from = getEmailFrom()
  console.log("From:", from)
  console.log("Embedded logo available:", hasEmbeddedEmailLogo())

  if (!isSmtpConfigured()) {
    console.error(
      "Not configured: set GOOGLE_REFRESH_TOKEN + GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + SMTP_USER, or SMTP_PASS"
    )
    process.exit(1)
  }

  console.log("SMTP_USER", process.env.SMTP_USER)
  console.log("Auth:", process.env.GOOGLE_REFRESH_TOKEN ? "Google OAuth" : "App Password")

  const transport = await createSmtpTransport()
  if (!transport) {
    const { getLastSmtpSetupError } = await import("../lib/email/smtp-transport")
    console.error("Could not create SMTP transport:", getLastSmtpSetupError() || "unknown")
    process.exit(1)
  }

  console.log("Verifying SMTP connection...")
  await transport.verify()
  console.log("Verify OK. Sending branded test to", to)

  const html = layoutEmail({
    title: "SMTP logo test",
    preheader: "Checking that the Impact Hub Nairobi logo renders in email clients.",
    bodyHtml:
      "<p>If the logo appears above this line, inline email branding is working.</p>",
    ctaLabel: "Open platform",
    ctaUrl: process.env.NEXT_PUBLIC_APP_URL || "https://impacthubnairobi-app.vercel.app",
  })

  const attachments = mergeEmailAttachments()
  console.log("Attachments:", attachments?.map((a) => `${a.filename}${a.contentId ? ` (cid:${a.contentId})` : ""}`))

  const info = await transport.sendMail({
    from: getEmailFromParts(),
    to,
    subject: "Community App SMTP + logo test",
    text: "If the HTML version shows the Impact Hub Nairobi logo, branding is working.",
    html,
    attachments: (attachments ?? []).map((file) => ({
      filename: file.filename,
      content: Buffer.from(file.content, "base64"),
      contentType: file.contentType ?? "application/octet-stream",
      cid: file.contentId,
      contentDisposition: "inline",
    })),
  })

  console.log("Sent:", info.messageId, info.response)
}

main().catch((err) => {
  console.error("FAILED:", err instanceof Error ? err.message : err)
  process.exit(1)
})
