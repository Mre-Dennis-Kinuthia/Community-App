import { formatEventWhen, layoutEmail, escapeHtml } from "./templates"
import { getEmailStaffTo } from "./config"
import { sendEmail, type SendEmailResult } from "./send"

export async function sendPasswordResetEmail(params: {
  to: string
  resetUrl: string
}): Promise<SendEmailResult> {
  const bodyHtml = `
    <p>You requested a password reset for your Impact Hub Nairobi account.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `
  return sendEmail({
    to: params.to,
    subject: "Reset your Impact Hub Nairobi password",
    html: layoutEmail({
      preheader: "Password reset link",
      title: "Reset your password",
      bodyHtml,
      ctaLabel: "Reset password",
      ctaUrl: params.resetUrl,
    }),
    text: `Reset your password: ${params.resetUrl}\nThis link expires in 1 hour.`,
  })
}

export async function sendEventRegistrationEmail(params: {
  to: string
  name?: string | null
  eventTitle: string
  eventStartDate: Date | string
  eventTimezone?: string | null
  eventUrl: string
  status: "registered" | "waitlisted" | "pending"
}): Promise<SendEmailResult> {
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi,"
  const when = formatEventWhen(params.eventStartDate, params.eventTimezone)

  const copy =
    params.status === "pending"
      ? {
          subject: `Application received — ${params.eventTitle}`,
          title: "Application submitted",
          detail:
            "Your registration is pending organizer approval. We will email you when it is reviewed.",
        }
      : params.status === "waitlisted"
        ? {
            subject: `Waitlist confirmation — ${params.eventTitle}`,
            title: "You are on the waitlist",
            detail:
              "The event is currently full. We will notify you if a spot opens up.",
          }
        : {
            subject: `You are registered — ${params.eventTitle}`,
            title: "Registration confirmed",
            detail: "You are confirmed for this event. See the event page for details and your ticket.",
          }

  const bodyHtml = `
    <p>${greeting}</p>
    <p>${escapeHtml(copy.detail)}</p>
    <p><strong>${escapeHtml(params.eventTitle)}</strong><br />
    ${escapeHtml(when)}</p>
  `

  return sendEmail({
    to: params.to,
    subject: copy.subject,
    html: layoutEmail({
      preheader: copy.title,
      title: copy.title,
      bodyHtml,
      ctaLabel: "View event",
      ctaUrl: params.eventUrl,
    }),
    text: `${copy.title}\n${params.eventTitle}\n${when}\n${params.eventUrl}`,
  })
}

export async function sendEventApplicationDecisionEmail(params: {
  to: string
  name?: string | null
  eventTitle: string
  eventStartDate: Date | string
  eventTimezone?: string | null
  eventUrl: string
  decision: "approved" | "rejected" | "promoted"
}): Promise<SendEmailResult> {
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi,"
  const when = formatEventWhen(params.eventStartDate, params.eventTimezone)

  const copy =
    params.decision === "rejected"
      ? {
          subject: `Application update — ${params.eventTitle}`,
          title: "Application not approved",
          detail:
            "Unfortunately your application was not approved for this event. Contact the organizer if you have questions.",
        }
      : params.decision === "promoted"
        ? {
            subject: `Spot available — ${params.eventTitle}`,
            title: "You are now registered",
            detail: "A spot opened up and you have been moved from the waitlist. You are confirmed for this event.",
          }
        : {
            subject: `Application approved — ${params.eventTitle}`,
            title: "Application approved",
            detail: "Your application has been approved. You are confirmed for this event.",
          }

  const bodyHtml = `
    <p>${greeting}</p>
    <p>${escapeHtml(copy.detail)}</p>
    <p><strong>${escapeHtml(params.eventTitle)}</strong><br />
    ${escapeHtml(when)}</p>
  `

  return sendEmail({
    to: params.to,
    subject: copy.subject,
    html: layoutEmail({
      preheader: copy.title,
      title: copy.title,
      bodyHtml,
      ctaLabel: params.decision === "rejected" ? "View events" : "View event",
      ctaUrl: params.eventUrl,
    }),
    text: `${copy.title}\n${params.eventTitle}\n${when}\n${params.eventUrl}`,
  })
}

export async function sendEventBlastEmail(params: {
  to: string
  name?: string | null
  blastTitle: string
  message: string
  eventTitle: string
  eventUrl: string
}): Promise<SendEmailResult> {
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi,"
  const bodyHtml = `
    <p>${greeting}</p>
    <p>${escapeHtml(params.message).replace(/\n/g, "<br />")}</p>
    <p style="margin-top:16px;color:#71717a;font-size:13px;">Regarding: <strong>${escapeHtml(params.eventTitle)}</strong></p>
  `

  return sendEmail({
    to: params.to,
    subject: params.blastTitle,
    html: layoutEmail({
      preheader: params.blastTitle,
      title: params.blastTitle,
      bodyHtml,
      ctaLabel: "Open event",
      ctaUrl: params.eventUrl,
    }),
    text: `${params.blastTitle}\n\n${params.message}\n\n${params.eventTitle}\n${params.eventUrl}`,
  })
}

export async function sendEventReminderEmail(params: {
  to: string
  name?: string | null
  eventTitle: string
  eventStartDate: Date | string
  eventTimezone?: string | null
  eventUrl: string
}): Promise<SendEmailResult> {
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi,"
  const when = formatEventWhen(params.eventStartDate, params.eventTimezone)
  const bodyHtml = `
    <p>${greeting}</p>
    <p>This is a reminder that you are registered for an upcoming event.</p>
    <p><strong>${escapeHtml(params.eventTitle)}</strong><br />
    ${escapeHtml(when)}</p>
  `

  return sendEmail({
    to: params.to,
    subject: `Reminder: ${params.eventTitle}`,
    html: layoutEmail({
      preheader: "Event starting soon",
      title: "Event reminder",
      bodyHtml,
      ctaLabel: "View event",
      ctaUrl: params.eventUrl,
    }),
    text: `Reminder: ${params.eventTitle}\n${when}\n${params.eventUrl}`,
  })
}

export async function sendWorkspaceInquiryConfirmationEmail(params: {
  to: string
  name: string
  inquiryLabel: string
}): Promise<SendEmailResult> {
  const bodyHtml = `
    <p>Hi ${escapeHtml(params.name)},</p>
    <p>We received your <strong>${escapeHtml(params.inquiryLabel)}</strong> request.</p>
    <p>Our team will contact you shortly to discuss availability and pricing.</p>
  `

  return sendEmail({
    to: params.to,
    subject: "We received your workspace inquiry",
    html: layoutEmail({
      preheader: "Inquiry received",
      title: "Thank you for your inquiry",
      bodyHtml,
    }),
    text: `We received your ${params.inquiryLabel} request. Our team will contact you soon.`,
  })
}

export async function sendWorkspaceInquiryStaffEmail(params: {
  inquiryLabel: string
  name: string
  email: string
  phone: string
  details: string
}): Promise<SendEmailResult> {
  const staffTo = getEmailStaffTo()

  const bodyHtml = `
    <p><strong>${escapeHtml(params.inquiryLabel)}</strong></p>
    <p><strong>Name:</strong> ${escapeHtml(params.name)}<br />
    <strong>Email:</strong> ${escapeHtml(params.email)}<br />
    <strong>Phone:</strong> ${escapeHtml(params.phone)}</p>
    <pre style="white-space:pre-wrap;font-family:inherit;background:#f4f4f5;padding:12px;border-radius:6px;font-size:13px;">${escapeHtml(params.details)}</pre>
  `

  return sendEmail({
    to: staffTo,
    subject: `[Workspace] ${params.inquiryLabel} — ${params.name}`,
    html: layoutEmail({
      title: "New workspace inquiry",
      bodyHtml,
    }),
    text: `${params.inquiryLabel}\n${params.name}\n${params.email}\n${params.phone}\n\n${params.details}`,
    replyTo: params.email,
  })
}
