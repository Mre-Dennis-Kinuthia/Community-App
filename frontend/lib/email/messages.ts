import {
  formatBookingDate,
  formatBookingTimeRange,
  formatResourceType,
} from "@/lib/booking-format"
import { getAppBaseUrl, getDashboardBookingUrl, getNewsArticleUrl } from "@/lib/app-url"
import { formatEventWhen, layoutEmail, escapeHtml } from "./templates"
import { getEmailStaffTo } from "./config"
import { sendEmail, type EmailAttachment, type SendEmailResult } from "./send"

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
  calendarInvite?: { content: string; filename: string }
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
            detail:
              "You are confirmed for this event. A calendar invite is attached — open it to add the event to your calendar (Google Calendar, Apple Calendar, Outlook, etc.).",
          }

  const bodyHtml = `
    <p>${greeting}</p>
    <p>${escapeHtml(copy.detail)}</p>
    <p><strong>${escapeHtml(params.eventTitle)}</strong><br />
    ${escapeHtml(when)}</p>
  `

  const attachments: EmailAttachment[] | undefined =
    params.status === "registered" && params.calendarInvite
      ? [
          {
            filename: params.calendarInvite.filename,
            content: params.calendarInvite.content,
            contentType: "text/calendar; method=REQUEST; charset=UTF-8",
          },
        ]
      : undefined

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
    attachments,
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
  calendarInvite?: { content: string; filename: string }
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
            detail:
              "A spot opened up and you have been moved from the waitlist. A calendar invite is attached — open it to add the event to your calendar.",
          }
        : {
            subject: `Application approved — ${params.eventTitle}`,
            title: "Application approved",
            detail:
              "Your application has been approved. A calendar invite is attached — open it to add the event to your calendar.",
          }

  const bodyHtml = `
    <p>${greeting}</p>
    <p>${escapeHtml(copy.detail)}</p>
    <p><strong>${escapeHtml(params.eventTitle)}</strong><br />
    ${escapeHtml(when)}</p>
  `

  const attachments: EmailAttachment[] | undefined =
    params.decision !== "rejected" && params.calendarInvite
      ? [
          {
            filename: params.calendarInvite.filename,
            content: params.calendarInvite.content,
            contentType: "text/calendar; method=REQUEST; charset=UTF-8",
          },
        ]
      : undefined

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
    attachments,
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

export async function sendBookingConfirmationEmail(params: {
  to: string
  name?: string | null
  bookingId: string
  resourceType: string
  date: Date | string
  startTime: string
  endTime?: string | null
  totalPrice: number
  listPrice?: number | null
  membershipDiscount?: number | null
}): Promise<SendEmailResult> {
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi,"
  const resource = formatResourceType(params.resourceType)
  const when = formatBookingDate(params.date)
  const time = formatBookingTimeRange(params.startTime, params.endTime)
  const bookingUrl = getDashboardBookingUrl(params.bookingId)

  const bodyHtml = `
    <p>${greeting}</p>
    <p>Your workspace booking is confirmed.</p>
    <p><strong>${escapeHtml(resource)}</strong><br />
    ${escapeHtml(when)}<br />
    ${escapeHtml(time)}</p>
    ${
      (params.membershipDiscount ?? 0) > 0
        ? `<p><strong>Subtotal:</strong> KES ${(params.listPrice ?? params.totalPrice).toLocaleString("en-KE")}<br />
    <strong>Membership benefit:</strong> −KES ${params.membershipDiscount!.toLocaleString("en-KE")}</p>`
        : ""
    }
    <p><strong>Total:</strong> KES ${params.totalPrice.toLocaleString("en-KE")}</p>
  `

  const discountLine =
    (params.membershipDiscount ?? 0) > 0
      ? `\nMembership benefit: −KES ${params.membershipDiscount!.toLocaleString("en-KE")}`
      : ""

  return sendEmail({
    to: params.to,
    subject: `Booking confirmed — ${resource}`,
    html: layoutEmail({
      preheader: "Your booking is confirmed",
      title: "Booking confirmed",
      bodyHtml,
      ctaLabel: "View booking",
      ctaUrl: bookingUrl,
    }),
    text: `Booking confirmed\n${resource}\n${when}\n${time}${discountLine}\nTotal: KES ${params.totalPrice.toLocaleString("en-KE")}\n${bookingUrl}`,
  })
}

export async function sendBookingCancelledEmail(params: {
  to: string
  name?: string | null
  resourceType: string
  date: Date | string
  startTime: string
  endTime?: string | null
}): Promise<SendEmailResult> {
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi,"
  const resource = formatResourceType(params.resourceType)
  const when = formatBookingDate(params.date)
  const time = formatBookingTimeRange(params.startTime, params.endTime)
  const bookingsUrl = `${getAppBaseUrl()}/dashboard/bookings`

  const bodyHtml = `
    <p>${greeting}</p>
    <p>Your workspace booking has been cancelled.</p>
    <p><strong>${escapeHtml(resource)}</strong><br />
    ${escapeHtml(when)}<br />
    ${escapeHtml(time)}</p>
    <p>If you have questions, reply to this email or contact our team.</p>
  `

  return sendEmail({
    to: params.to,
    subject: `Booking cancelled — ${resource}`,
    html: layoutEmail({
      preheader: "Your booking was cancelled",
      title: "Booking cancelled",
      bodyHtml,
      ctaLabel: "My bookings",
      ctaUrl: bookingsUrl,
    }),
    text: `Booking cancelled\n${resource}\n${when}\n${time}\n${bookingsUrl}`,
  })
}

export async function sendEventRegistrationCancelledEmail(params: {
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
    <p>Your registration has been cancelled for the following event.</p>
    <p><strong>${escapeHtml(params.eventTitle)}</strong><br />
    ${escapeHtml(when)}</p>
  `

  return sendEmail({
    to: params.to,
    subject: `Registration cancelled — ${params.eventTitle}`,
    html: layoutEmail({
      preheader: "Event registration cancelled",
      title: "Registration cancelled",
      bodyHtml,
      ctaLabel: "Browse events",
      ctaUrl: `${getAppBaseUrl()}/events`,
    }),
    text: `Registration cancelled\n${params.eventTitle}\n${when}`,
  })
}

export async function sendWelcomeEmail(params: {
  to: string
  name?: string | null
}): Promise<SendEmailResult> {
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi,"
  const appUrl = getAppBaseUrl()

  const bodyHtml = `
    <p>${greeting}</p>
    <p>Welcome to Impact Hub Nairobi! Your account is ready.</p>
    <p>Book workspace, register for events, and stay up to date with community news from your dashboard.</p>
  `

  return sendEmail({
    to: params.to,
    subject: "Welcome to Impact Hub Nairobi",
    html: layoutEmail({
      preheader: "Your account is ready",
      title: "Welcome aboard",
      bodyHtml,
      ctaLabel: "Go to dashboard",
      ctaUrl: `${appUrl}/dashboard`,
    }),
    text: `Welcome to Impact Hub Nairobi!\n${appUrl}/dashboard`,
  })
}

export async function sendNewsletterSubscribeEmail(params: {
  to: string
}): Promise<SendEmailResult> {
  const appUrl = getAppBaseUrl()

  const bodyHtml = `
    <p>Thanks for subscribing to Impact Hub Nairobi updates.</p>
    <p>You will receive news and announcements about events, programs, and the community.</p>
  `

  return sendEmail({
    to: params.to,
    subject: "You are subscribed to Impact Hub Nairobi updates",
    html: layoutEmail({
      preheader: "Subscription confirmed",
      title: "Subscription confirmed",
      bodyHtml,
      ctaLabel: "Visit our site",
      ctaUrl: appUrl,
    }),
    text: `Thanks for subscribing to Impact Hub Nairobi updates.\n${appUrl}`,
  })
}

export async function sendNewsArticleEmail(params: {
  to: string
  name?: string | null
  title: string
  excerpt?: string | null
  postId: string
}): Promise<SendEmailResult> {
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi,"
  const articleUrl = getNewsArticleUrl(params.postId)
  const excerpt = params.excerpt?.trim()

  const bodyHtml = `
    <p>${greeting}</p>
    <p>A new article has been published on Impact Hub Nairobi.</p>
    <p><strong>${escapeHtml(params.title)}</strong></p>
    ${excerpt ? `<p>${escapeHtml(excerpt)}</p>` : ""}
  `

  return sendEmail({
    to: params.to,
    subject: `New article: ${params.title}`,
    html: layoutEmail({
      preheader: params.title,
      title: "New community update",
      bodyHtml,
      ctaLabel: "Read article",
      ctaUrl: articleUrl,
    }),
    text: `New article: ${params.title}${excerpt ? `\n\n${excerpt}` : ""}\n${articleUrl}`,
  })
}

async function sendStaffAlertEmail(params: {
  subject: string
  title: string
  bodyHtml: string
  text: string
  replyTo?: string
}): Promise<SendEmailResult> {
  return sendEmail({
    to: getEmailStaffTo(),
    subject: params.subject,
    html: layoutEmail({
      title: params.title,
      bodyHtml: params.bodyHtml,
    }),
    text: params.text,
    replyTo: params.replyTo,
  })
}

export async function sendNewBookingStaffEmail(params: {
  memberName?: string | null
  memberEmail: string
  bookingId: string
  resourceType: string
  date: Date | string
  startTime: string
  endTime?: string | null
  totalPrice: number
  notes?: string | null
}): Promise<SendEmailResult> {
  const resource = formatResourceType(params.resourceType)
  const when = formatBookingDate(params.date)
  const time = formatBookingTimeRange(params.startTime, params.endTime)
  const memberLabel = params.memberName
    ? `${escapeHtml(params.memberName)} (${escapeHtml(params.memberEmail)})`
    : escapeHtml(params.memberEmail)

  const bodyHtml = `
    <p>A new workspace booking was created.</p>
    <p><strong>Member:</strong> ${memberLabel}<br />
    <strong>Resource:</strong> ${escapeHtml(resource)}<br />
    <strong>Date:</strong> ${escapeHtml(when)}<br />
    <strong>Time:</strong> ${escapeHtml(time)}<br />
    <strong>Total:</strong> KES ${params.totalPrice.toLocaleString("en-KE")}<br />
    <strong>Reference:</strong> ${escapeHtml(params.bookingId)}</p>
    ${params.notes ? `<p><strong>Notes:</strong> ${escapeHtml(params.notes)}</p>` : ""}
  `

  return sendStaffAlertEmail({
    subject: `[Booking] New ${resource} — ${params.memberEmail}`,
    title: "New booking",
    bodyHtml,
    text: `New booking\nMember: ${params.memberName ?? params.memberEmail}\n${resource}\n${when}\n${time}\nKES ${params.totalPrice}`,
    replyTo: params.memberEmail,
  })
}

export async function sendNewAccountStaffEmail(params: {
  name?: string | null
  email: string
}): Promise<SendEmailResult> {
  const memberLabel = params.name
    ? `${escapeHtml(params.name)} (${escapeHtml(params.email)})`
    : escapeHtml(params.email)

  const bodyHtml = `
    <p>A new member account was created.</p>
    <p><strong>Member:</strong> ${memberLabel}</p>
  `

  return sendStaffAlertEmail({
    subject: `[Account] New member — ${params.email}`,
    title: "New account",
    bodyHtml,
    text: `New account: ${params.name ?? params.email} (${params.email})`,
    replyTo: params.email,
  })
}

export async function sendEventRegistrationStaffEmail(params: {
  memberName?: string | null
  memberEmail: string
  eventTitle: string
  eventStartDate: Date | string
  eventTimezone?: string | null
  status: "registered" | "waitlisted" | "pending"
}): Promise<SendEmailResult> {
  const when = formatEventWhen(params.eventStartDate, params.eventTimezone)
  const memberLabel = params.memberName
    ? `${escapeHtml(params.memberName)} (${escapeHtml(params.memberEmail)})`
    : escapeHtml(params.memberEmail)
  const statusLabel =
    params.status === "pending"
      ? "Pending approval"
      : params.status === "waitlisted"
        ? "Waitlisted"
        : "Registered"

  const bodyHtml = `
    <p>New event registration.</p>
    <p><strong>Member:</strong> ${memberLabel}<br />
    <strong>Status:</strong> ${escapeHtml(statusLabel)}<br />
    <strong>Event:</strong> ${escapeHtml(params.eventTitle)}<br />
    ${escapeHtml(when)}</p>
  `

  return sendStaffAlertEmail({
    subject: `[Event] ${statusLabel} — ${params.eventTitle}`,
    title: "Event registration",
    bodyHtml,
    text: `Event registration (${statusLabel})\n${params.memberName ?? params.memberEmail}\n${params.eventTitle}\n${when}`,
    replyTo: params.memberEmail,
  })
}

export async function sendNewsletterSubscribeStaffEmail(params: {
  email: string
}): Promise<SendEmailResult> {
  const bodyHtml = `
    <p>Someone subscribed to the newsletter.</p>
    <p><strong>Email:</strong> ${escapeHtml(params.email)}</p>
  `

  return sendStaffAlertEmail({
    subject: `[Newsletter] New subscriber — ${params.email}`,
    title: "Newsletter signup",
    bodyHtml,
    text: `Newsletter subscriber: ${params.email}`,
    replyTo: params.email,
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

export async function sendAccountDeletedEmail(params: {
  to: string
  name?: string | null
  deletedBy?: "self" | "admin"
}): Promise<SendEmailResult> {
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi,"
  const intro =
    params.deletedBy === "self"
      ? "This confirms that your Impact Hub Nairobi community account was permanently deleted at your request."
      : "This confirms that your Impact Hub Nairobi community account was permanently deleted."

  const bodyHtml = `
    <p>${greeting}</p>
    <p>${intro}</p>
    <p>Your profile, sign-in access, bookings, and other personal data tied to this account have been removed from our platform.</p>
    <p>If you did not request this, contact us immediately at our support channels.</p>
    <p style="font-size:13px;color:#71717a;">You will no longer receive community emails at this address from this account.</p>
  `

  return sendEmail({
    to: params.to,
    subject: "Your Impact Hub Nairobi account has been deleted",
    html: layoutEmail({
      preheader: "Account permanently deleted",
      title: "Account deleted",
      bodyHtml,
    }),
    text: [
      greeting.replace(/<[^>]+>/g, ""),
      intro,
      "Your profile, sign-in access, bookings, and personal data tied to this account have been removed.",
      "If you did not request this, contact our team immediately.",
    ].join("\n\n"),
  })
}
