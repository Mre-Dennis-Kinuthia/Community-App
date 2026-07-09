import type { OrganisationalInquiryPayload } from "@/lib/email/membership-organisational-inquiry"
import {
  sendOrganisationalInquiryConfirmationEmail,
  sendOrganisationalInquiryStaffEmail,
} from "@/lib/email/membership-organisational-inquiry"
import {
  isEmailConfigured,
  sendEmailsInBackground,
  type SendEmailResult,
} from "@/lib/email/send"

/** Send staff + applicant emails after an organisational application is stored */
export function queueOrganisationalInquiryEmails(
  payload: OrganisationalInquiryPayload
): boolean {
  if (!isEmailConfigured()) {
    console.error(
      "[ORGANISATIONAL] Email not configured. Application saved; no emails sent."
    )
    return false
  }

  sendEmailsInBackground([
    {
      send: () => sendOrganisationalInquiryStaffEmail(payload),
      context: "organisational-inquiry-staff",
    },
    {
      send: () =>
        sendOrganisationalInquiryConfirmationEmail({
          fullName: payload.fullName,
          email: payload.email,
          organizationName: payload.organizationName,
        }),
      context: "organisational-inquiry-confirmation",
    },
  ])

  return true
}

/** Synchronous send for scripts/tests only */
export async function sendOrganisationalInquiryEmailsNow(
  payload: OrganisationalInquiryPayload
): Promise<{ staff: SendEmailResult; confirmation: SendEmailResult }> {
  const staff = await sendOrganisationalInquiryStaffEmail(payload)
  const confirmation = await sendOrganisationalInquiryConfirmationEmail({
    fullName: payload.fullName,
    email: payload.email,
    organizationName: payload.organizationName,
  })
  return { staff, confirmation }
}
