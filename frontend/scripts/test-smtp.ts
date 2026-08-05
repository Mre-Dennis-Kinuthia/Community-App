/**
 * Send a branded test email.
 * Run: npx tsx --env-file=.env.local scripts/test-smtp.ts [recipient@email.com]
 */
import { getEmailFrom, getEmailFromParts } from "../lib/email/config"
import { layoutEmail } from "../lib/email/templates"
import { createSmtpTransport, isSmtpConfigured } from "../lib/email/smtp-transport"

const to = process.argv[2] || process.env.EMAIL_STAFF_TO || "dennis.ndungu@impacthub.net"

async function main() {
  const from = getEmailFrom()
  console.log("From:", from)

  if (!isSmtpConfigured()) {
    console.error(
      "Not configured: set GOOGLE_REFRESH_TOKEN + GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + SMTP_USER, or SMTP_PASS"
    )
    process.exit(1)
  }

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
    title: "SMTP test",
    preheader: "Checking that Impact Hub Nairobi emails send correctly.",
    bodyHtml: `<p>If you received this message, SMTP delivery is working.</p>`,
    ctaLabel: "Open platform",
    ctaUrl: process.env.NEXT_PUBLIC_APP_URL || "https://impacthubnairobi-app.vercel.app",
  })

  const info = await transport.sendMail({
    from: getEmailFromParts(),
    to,
    subject: "Community App SMTP test",
    text: "If you received this message, SMTP delivery is working.",
    html,
  })

  console.log("Sent:", info.messageId, info.response)
}

main().catch((err) => {
  console.error("FAILED:", err instanceof Error ? err.message : err)
  process.exit(1)
})
