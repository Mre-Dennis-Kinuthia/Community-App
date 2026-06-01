/**
 * Send a password-reset-style test email (same path as forgot-password).
 * Run: npx tsx --env-file=.env.local scripts/test-forgot-password-email.ts [email]
 */
import { sendPasswordResetEmail } from "../lib/email/messages"

const email = (process.argv[2] || "dennis.ndungu@impacthub.net").toLowerCase().trim()
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=TEST_TOKEN&email=${encodeURIComponent(email)}`

async function main() {
  console.log("Sending password reset email to:", email)
  const result = await sendPasswordResetEmail({ to: email, resetUrl })
  console.log("Result:", result)
  if (!result.ok) process.exit(1)
}

main()
