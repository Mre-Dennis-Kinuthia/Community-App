/**
 * Test SMTP (Google OAuth or App Password).
 * Run: npx tsx --env-file=.env.local scripts/test-smtp.ts [recipient@email.com]
 */
import { getEmailFrom, getEmailFromParts } from "../lib/email/config"
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
  console.log("Verify OK. Sending test to", to)

  const info = await transport.sendMail({
    from: getEmailFromParts(),
    to,
    subject: "Community App SMTP test",
    text: "If you received this, Google SMTP is working.",
  })

  console.log("Sent:", info.messageId, info.response)
}

main().catch((err) => {
  console.error("FAILED:", err instanceof Error ? err.message : err)
  process.exit(1)
})
