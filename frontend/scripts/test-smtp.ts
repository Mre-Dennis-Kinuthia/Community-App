/**
 * Test SMTP (Google OAuth or App Password).
 * Run: npx tsx --env-file=.env.local scripts/test-smtp.ts [recipient@email.com]
 */
import nodemailer from "nodemailer"

const to = process.argv[2] || process.env.EMAIL_STAFF_TO || "dennis.ndungu@impacthub.net"

async function main() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.EMAIL_FROM

  if (!host || !user || !pass || !from) {
    console.error("Missing SMTP_HOST, SMTP_USER, SMTP_PASS, or EMAIL_FROM in env")
    process.exit(1)
  }

  const transport = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  })

  console.log("Verifying SMTP connection...")
  await transport.verify()
  console.log("Verify OK. Sending test to", to)

  const info = await transport.sendMail({
    from,
    to,
    subject: "Community App SMTP test",
    text: "If you received this, Brevo SMTP is working.",
  })

  console.log("Sent:", info.messageId, info.response)
}

main().catch((err) => {
  console.error("FAILED:", err instanceof Error ? err.message : err)
  process.exit(1)
})
