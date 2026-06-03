/**
 * Send sample Star Connect membership emails (staff + applicant).
 * Run: npx tsx --env-file=.env.local scripts/test-star-connect-emails.ts [applicant@email.com]
 */
import { isEmailConfigured, getEmailStaffTo, getEmailFrom } from "../lib/email/send"
import { sendStarConnectInquiryEmailsNow } from "../lib/membership-star-connect"
import type { StarConnectInquiryPayload } from "../lib/email/membership-inquiry"

const applicantEmail = process.argv[2] || process.env.EMAIL_STAFF_TO || "dennis.ndungu@impacthub.net"

const sample: StarConnectInquiryPayload = {
  fullName: "Test Applicant",
  email: applicantEmail,
  phone: "+254700000000",
  location: "Nairobi, Kenya",
  linkedinUrl: "https://www.linkedin.com/in/example",
  websiteUrl: "https://example.com",
  organization: "Sample Ventures Ltd",
  ventureDescription:
    "We build solar-powered cold storage for smallholder farmers to reduce post-harvest loss and improve incomes.",
  role: "Founder / Co-founder",
  sector: "Agriculture & Food Systems",
  ventureStage: "Early stage (0–2 years)",
  primaryNeeds: [
    "Business development & advisory",
    "Workspace & meeting rooms",
    "Investor & grant introductions",
  ],
  workspaceNeed: "Several days per week",
  targetStart: "Within 1 month",
  supportNeeded:
    "Need introductions to grant programs and a consistent workspace while we pilot with 3 farmer cooperatives.",
  howHeard: "Impact Hub event",
  message: "Test submission from scripts/test-star-connect-emails.ts",
}

async function main() {
  console.log("EMAIL_FROM:", getEmailFrom())
  console.log("EMAIL_STAFF_TO:", getEmailStaffTo())
  console.log("Applicant (confirmation):", applicantEmail)

  if (!isEmailConfigured()) {
    console.error("Email not configured. Set EMAIL_PROVIDER=smtp and Google OAuth vars in .env.local")
    process.exit(1)
  }

  const { staff, confirmation } = await sendStarConnectInquiryEmailsNow(sample)

  if (!staff.ok) {
    console.error("Staff email failed:", staff.error)
    process.exit(1)
  }
  console.log("Staff email OK", staff.id ?? "")

  if (!confirmation.ok) {
    console.error("Confirmation email failed:", confirmation.error)
    process.exit(1)
  }
  console.log("Confirmation email OK", confirmation.id ?? "")

  console.log("Done — check both inboxes.")
}

main().catch((err) => {
  console.error("FAILED:", err instanceof Error ? err.message : err)
  process.exit(1)
})
