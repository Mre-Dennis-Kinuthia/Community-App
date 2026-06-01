/**
 * Transactional email (SMTP or Resend).
 * @see docs/GOOGLE_WORKSPACE_EMAIL.md
 */
export {
  isEmailConfigured,
  getEmailFrom,
  getEmailStaffTo,
  getEmailProvider,
  sendEmail,
  sendEmailInBackground,
  sendEmailsInBackground,
  type SendEmailResult,
  type EmailProvider,
  type EmailTask,
} from "@/lib/email/send"

export {
  sendPasswordResetEmail,
  sendEventRegistrationEmail,
  sendEventApplicationDecisionEmail,
  sendEventRegistrationCancelledEmail,
  sendEventBlastEmail,
  sendEventReminderEmail,
  sendBookingConfirmationEmail,
  sendBookingCancelledEmail,
  sendWelcomeEmail,
  sendNewsletterSubscribeEmail,
  sendNewsArticleEmail,
  sendNewBookingStaffEmail,
  sendNewAccountStaffEmail,
  sendEventRegistrationStaffEmail,
  sendNewsletterSubscribeStaffEmail,
  sendWorkspaceInquiryConfirmationEmail,
  sendWorkspaceInquiryStaffEmail,
} from "@/lib/email/messages"
