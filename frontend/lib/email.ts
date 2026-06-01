/**
 * Transactional email (SMTP or Resend).
 * @see docs/EMAIL_SETUP.md
 */
export {
  isEmailConfigured,
  getEmailFrom,
  getEmailStaffTo,
  getEmailProvider,
  sendEmail,
  sendEmailInBackground,
  type SendEmailResult,
  type EmailProvider,
} from "@/lib/email/send"

export {
  sendPasswordResetEmail,
  sendEventRegistrationEmail,
  sendEventApplicationDecisionEmail,
  sendEventBlastEmail,
  sendEventReminderEmail,
  sendWorkspaceInquiryConfirmationEmail,
  sendWorkspaceInquiryStaffEmail,
} from "@/lib/email/messages"
