import type { StarConnectInquiryPayload } from "@/lib/email/membership-inquiry"
import {
  sendStarConnectInquiryConfirmationEmail,
  sendStarConnectInquiryStaffEmail,
} from "@/lib/email/membership-inquiry"
import {
  isEmailConfigured,
  sendEmailsInBackground,
  type SendEmailResult,
} from "@/lib/email/send"

/** Send staff + applicant emails after a Star Connect application is stored */
export function queueStarConnectInquiryEmails(payload: StarConnectInquiryPayload): boolean {
  if (!isEmailConfigured()) {
    console.error(
      "[STAR CONNECT] Email not configured (set EMAIL_PROVIDER=smtp and Google OAuth or RESEND_API_KEY). Application saved; no emails sent."
    )
    return false
  }

  sendEmailsInBackground(
    [
      {
        send: () => sendStarConnectInquiryStaffEmail(payload),
        context: "star-connect-inquiry-staff",
      },
      {
        send: () =>
          sendStarConnectInquiryConfirmationEmail({
            fullName: payload.fullName,
            email: payload.email,
          }),
        context: "star-connect-inquiry-confirmation",
      },
    ]
  )

  return true
}

/** Synchronous send for scripts/tests only */
export async function sendStarConnectInquiryEmailsNow(
  payload: StarConnectInquiryPayload
): Promise<{ staff: SendEmailResult; confirmation: SendEmailResult }> {
  const staff = await sendStarConnectInquiryStaffEmail(payload)
  const confirmation = await sendStarConnectInquiryConfirmationEmail({
    fullName: payload.fullName,
    email: payload.email,
  })
  return { staff, confirmation }
}
