import {
  formatBookingDate,
  formatBookingTimeRange,
  formatResourceType,
} from "@/lib/booking-format"
import { formatBookingAddOnsHtml, formatBookingAddOnsPlainText } from "@/lib/booking-add-ons"
import { getAppBaseUrl, getDashboardBookingUrl, getNewsArticleUrl } from "@/lib/app-url"
import { formatHubDateTime } from "@/lib/space/hub-timezone"
import { formatEventWhen, layoutEmail, escapeHtml, emailGreeting, emailParagraph, emailDetailCard, emailMutedNote, emailHighlightBox } from "./templates"
import { getEmailStaffTo } from "./config"
import { sendEmail, type EmailAttachment, type SendEmailResult } from "./send"

export async function sendPasswordResetEmail(params: {
  to: string
  resetUrl: string
  name?: string | null
  initiatedByAdmin?: boolean
}): Promise<SendEmailResult> {
  const intro = params.initiatedByAdmin
    ? "An <strong>Impact Hub Nairobi</strong> administrator sent you a link to reset your community platform password."
    : "You requested a password reset for your <strong>Impact Hub Nairobi</strong> account."

  const bodyHtml = `
    ${emailGreeting(params.name)}
    ${emailParagraph(intro)}
    ${emailMutedNote("If you did not expect this, you can safely ignore this email. The link expires in 1 hour.")}
  `
  return sendEmail({
    to: params.to,
    subject: "Reset your Impact Hub Nairobi password",
    html: layoutEmail({
      preheader: "Password reset link",
      title: "Reset your password",
      eyebrow: "Account",
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
    ${emailGreeting(params.name)}
    ${emailParagraph(escapeHtml(copy.detail))}
    ${emailDetailCard(
      [
        { label: "Event", value: escapeHtml(params.eventTitle) },
        { label: "When", value: escapeHtml(when) },
      ],
      { title: "Event details" }
    )}
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
      eyebrow: "Events",
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
    ${emailGreeting(params.name)}
    ${emailParagraph(escapeHtml(copy.detail))}
    ${emailDetailCard(
      [
        { label: "Event", value: escapeHtml(params.eventTitle) },
        { label: "When", value: escapeHtml(when) },
      ],
      { title: "Event details" }
    )}
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
      eyebrow: "Events",
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
  const bodyHtml = `
    ${emailGreeting(params.name)}
    ${emailHighlightBox(escapeHtml(params.message).replace(/\n/g, "<br />"))}
    ${emailMutedNote(`Regarding: <strong>${escapeHtml(params.eventTitle)}</strong>`)}
  `

  return sendEmail({
    to: params.to,
    subject: params.blastTitle,
    html: layoutEmail({
      preheader: params.blastTitle,
      title: params.blastTitle,
      eyebrow: "Events",
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
  const when = formatEventWhen(params.eventStartDate, params.eventTimezone)
  const bodyHtml = `
    ${emailGreeting(params.name)}
    ${emailParagraph("This is a reminder that you are registered for an upcoming event.")}
    ${emailDetailCard(
      [
        { label: "Event", value: escapeHtml(params.eventTitle) },
        { label: "When", value: escapeHtml(when) },
      ],
      { title: "Event details" }
    )}
  `

  return sendEmail({
    to: params.to,
    subject: `Reminder: ${params.eventTitle}`,
    html: layoutEmail({
      preheader: "Event starting soon",
      title: "Event reminder",
      eyebrow: "Events",
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
    ${emailGreeting(params.name)}
    ${emailParagraph(`We received your <strong>${escapeHtml(params.inquiryLabel)}</strong> request.`)}
    ${emailParagraph("Our team will contact you shortly to discuss availability and pricing.")}
  `

  return sendEmail({
    to: params.to,
    subject: "We received your workspace inquiry",
    html: layoutEmail({
      preheader: "Inquiry received",
      title: "Thank you for your inquiry",
      eyebrow: "Workspace",
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
  addOns?: string[]
  addOnsPrice?: number
  pastriesPax?: number
  calendarInvite?: { content: string; filename: string }
}): Promise<SendEmailResult> {
  const greeting = params.name ? escapeHtml(params.name) : null
  const resource = formatResourceType(params.resourceType)
  const when = formatBookingDate(params.date)
  const time = formatBookingTimeRange(params.startTime, params.endTime)
  const bookingUrl = getDashboardBookingUrl(params.bookingId)
  const isMeetingRoom = params.resourceType === "meeting-room"
  const addOnsHtml = formatBookingAddOnsHtml({
    addOnIds: params.addOns ?? [],
    addOnsPrice: params.addOnsPrice,
    pastriesPax: params.pastriesPax,
  })
  const addOnsText = formatBookingAddOnsPlainText({
    addOnIds: params.addOns ?? [],
    addOnsPrice: params.addOnsPrice,
    pastriesPax: params.pastriesPax,
  })

  const detailRows = [
    { label: "Space", value: escapeHtml(resource) },
    { label: "Date", value: escapeHtml(when) },
    { label: "Time", value: escapeHtml(time) },
    {
      label: "Total",
      value: `KES ${params.totalPrice.toLocaleString("en-KE")}`,
    },
  ]

  const bodyHtml = `
    ${emailGreeting(greeting)}
    ${emailParagraph(
      `Your workspace booking is confirmed.${
        isMeetingRoom && params.calendarInvite
          ? " A calendar invite is attached — open it to add the booking to your calendar."
          : ""
      }`
    )}
    ${emailDetailCard(detailRows, { title: "Booking details" })}
    ${addOnsHtml}
    ${
      (params.membershipDiscount ?? 0) > 0
        ? emailMutedNote(
            `Membership benefit applied: −KES ${params.membershipDiscount!.toLocaleString("en-KE")}`
          )
        : ""
    }
  `

  const discountLine =
    (params.membershipDiscount ?? 0) > 0
      ? `\nMembership benefit: −KES ${params.membershipDiscount!.toLocaleString("en-KE")}`
      : ""

  const attachments =
    isMeetingRoom && params.calendarInvite
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
    subject: `Booking confirmed — ${resource}`,
    html: layoutEmail({
      preheader: "Your booking is confirmed",
      title: "Booking confirmed",
      eyebrow: "Workspace",
      bodyHtml,
      ctaLabel: "View booking",
      ctaUrl: bookingUrl,
    }),
    text: `Booking confirmed\n${resource}\n${when}\n${time}\nAdd-ons:\n${addOnsText}${discountLine}\nTotal: KES ${params.totalPrice.toLocaleString("en-KE")}\n${bookingUrl}`,
    attachments,
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
  const resource = formatResourceType(params.resourceType)
  const when = formatBookingDate(params.date)
  const time = formatBookingTimeRange(params.startTime, params.endTime)
  const bookingsUrl = `${getAppBaseUrl()}/dashboard/bookings`

  const bodyHtml = `
    ${emailGreeting(params.name)}
    ${emailParagraph("Your workspace booking has been cancelled.")}
    ${emailDetailCard(
      [
        { label: "Space", value: escapeHtml(resource) },
        { label: "Date", value: escapeHtml(when) },
        { label: "Time", value: escapeHtml(time) },
      ],
      { title: "Cancelled booking" }
    )}
    ${emailMutedNote("If you have questions, reply to this email or contact our team.")}
  `

  return sendEmail({
    to: params.to,
    subject: `Booking cancelled — ${resource}`,
    html: layoutEmail({
      preheader: "Your booking was cancelled",
      title: "Booking cancelled",
      eyebrow: "Workspace",
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
  const when = formatEventWhen(params.eventStartDate, params.eventTimezone)

  const bodyHtml = `
    ${emailGreeting(params.name)}
    ${emailParagraph("Your registration has been cancelled for the following event.")}
    ${emailDetailCard(
      [
        { label: "Event", value: escapeHtml(params.eventTitle) },
        { label: "When", value: escapeHtml(when) },
      ],
      { title: "Event details" }
    )}
  `

  return sendEmail({
    to: params.to,
    subject: `Registration cancelled — ${params.eventTitle}`,
    html: layoutEmail({
      preheader: "Event registration cancelled",
      title: "Registration cancelled",
      eyebrow: "Events",
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
  const appUrl = getAppBaseUrl()

  const bodyHtml = `
    ${emailGreeting(params.name)}
    ${emailParagraph("Welcome to <strong>Impact Hub Nairobi</strong> — Kenya's leading innovation community.")}
    ${emailParagraph("Your account is ready. Book workspace, register for events, connect with members, and stay up to date with community news.")}
    ${emailMutedNote("We're glad you're here. Let's build impact together.")}
  `

  return sendEmail({
    to: params.to,
    subject: "Welcome to Impact Hub Nairobi",
    html: layoutEmail({
      preheader: "Your account is ready",
      title: "Welcome aboard",
      eyebrow: "Member welcome",
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
    ${emailGreeting()}
    ${emailParagraph("Thanks for subscribing to <strong>Impact Hub Nairobi</strong> updates.")}
    ${emailParagraph("You will receive news and announcements about events, programs, and the community.")}
  `

  return sendEmail({
    to: params.to,
    subject: "You are subscribed to Impact Hub Nairobi updates",
    html: layoutEmail({
      preheader: "Subscription confirmed",
      title: "Subscription confirmed",
      eyebrow: "Newsletter",
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
  const articleUrl = getNewsArticleUrl(params.postId)
  const excerpt = params.excerpt?.trim()

  const bodyHtml = `
    ${emailGreeting(params.name)}
    ${emailParagraph("A new article has been published on Impact Hub Nairobi.")}
    ${emailDetailCard(
      [
        { label: "Article", value: escapeHtml(params.title) },
        ...(excerpt ? [{ label: "Preview", value: escapeHtml(excerpt) }] : []),
      ],
      { title: "Community news" }
    )}
  `

  return sendEmail({
    to: params.to,
    subject: `New article: ${params.title}`,
    html: layoutEmail({
      preheader: params.title,
      title: "New community update",
      eyebrow: "News",
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
  eyebrow?: string
}): Promise<SendEmailResult> {
  return sendEmail({
    to: getEmailStaffTo(),
    subject: params.subject,
    html: layoutEmail({
      title: params.title,
      eyebrow: params.eyebrow ?? "Staff alert",
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
  addOns?: string[]
  addOnsPrice?: number
  pastriesPax?: number
}): Promise<SendEmailResult> {
  const resource = formatResourceType(params.resourceType)
  const when = formatBookingDate(params.date)
  const time = formatBookingTimeRange(params.startTime, params.endTime)
  const memberLabel = params.memberName
    ? `${escapeHtml(params.memberName)} (${escapeHtml(params.memberEmail)})`
    : escapeHtml(params.memberEmail)
  const addOnsHtml = formatBookingAddOnsHtml({
    addOnIds: params.addOns ?? [],
    addOnsPrice: params.addOnsPrice,
    pastriesPax: params.pastriesPax,
  })
  const addOnsText = formatBookingAddOnsPlainText({
    addOnIds: params.addOns ?? [],
    addOnsPrice: params.addOnsPrice,
    pastriesPax: params.pastriesPax,
  })

  const bodyHtml = `
    ${emailParagraph("A new workspace booking was created.")}
    ${emailDetailCard(
      [
        { label: "Member", value: memberLabel },
        { label: "Resource", value: escapeHtml(resource) },
        { label: "Date", value: escapeHtml(when) },
        { label: "Time", value: escapeHtml(time) },
        { label: "Total", value: `KES ${params.totalPrice.toLocaleString("en-KE")}` },
        { label: "Reference", value: escapeHtml(params.bookingId) },
      ],
      { title: "Booking details" }
    )}
    ${addOnsHtml}
    ${params.notes ? emailHighlightBox(`<strong>Notes</strong><br />${escapeHtml(params.notes)}`) : ""}
  `

  return sendStaffAlertEmail({
    subject: `[Booking] New ${resource} — ${params.memberEmail}`,
    title: "New booking",
    eyebrow: "Workspace",
    bodyHtml,
    text: `New booking\nMember: ${params.memberName ?? params.memberEmail}\n${resource}\n${when}\n${time}\nAdd-ons:\n${addOnsText}\nKES ${params.totalPrice}`,
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
    ${emailParagraph("A new member account was created.")}
    ${emailDetailCard([{ label: "Member", value: memberLabel }], { title: "New account" })}
  `

  return sendStaffAlertEmail({
    subject: `[Account] New member — ${params.email}`,
    title: "New account",
    eyebrow: "Community",
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
    ${emailParagraph("New event registration.")}
    ${emailDetailCard(
      [
        { label: "Member", value: memberLabel },
        { label: "Status", value: escapeHtml(statusLabel) },
        { label: "Event", value: escapeHtml(params.eventTitle) },
        { label: "When", value: escapeHtml(when) },
      ],
      { title: "Registration" }
    )}
  `

  return sendStaffAlertEmail({
    subject: `[Event] ${statusLabel} — ${params.eventTitle}`,
    title: "Event registration",
    eyebrow: "Events",
    bodyHtml,
    text: `Event registration (${statusLabel})\n${params.memberName ?? params.memberEmail}\n${params.eventTitle}\n${when}`,
    replyTo: params.memberEmail,
  })
}

export async function sendNewsletterSubscribeStaffEmail(params: {
  email: string
}): Promise<SendEmailResult> {
  const bodyHtml = `
    ${emailParagraph("Someone subscribed to the newsletter.")}
    ${emailDetailCard([{ label: "Email", value: escapeHtml(params.email) }], { title: "Subscriber" })}
  `

  return sendStaffAlertEmail({
    subject: `[Newsletter] New subscriber — ${params.email}`,
    title: "Newsletter signup",
    eyebrow: "Newsletter",
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
    ${emailParagraph(`<strong>${escapeHtml(params.inquiryLabel)}</strong>`)}
    ${emailDetailCard(
      [
        { label: "Name", value: escapeHtml(params.name) },
        { label: "Email", value: escapeHtml(params.email) },
        { label: "Phone", value: escapeHtml(params.phone) },
      ],
      { title: "Inquiry details" }
    )}
    ${emailHighlightBox(escapeHtml(params.details).replace(/\n/g, "<br />"))}
  `

  return sendEmail({
    to: staffTo,
    subject: `[Workspace] ${params.inquiryLabel} — ${params.name}`,
    html: layoutEmail({
      title: "New workspace inquiry",
      eyebrow: "Workspace",
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
  const intro =
    params.deletedBy === "self"
      ? "This confirms that your Impact Hub Nairobi community account was permanently deleted at your request."
      : "This confirms that your Impact Hub Nairobi community account was permanently deleted."

  const bodyHtml = `
    ${emailGreeting(params.name)}
    ${emailParagraph(intro)}
    ${emailParagraph(
      "Your profile, sign-in access, bookings, and other personal data tied to this account have been removed from our platform."
    )}
    ${emailMutedNote(
      "If you did not request this, contact us immediately. You will no longer receive community emails at this address from this account."
    )}
  `

  return sendEmail({
    to: params.to,
    subject: "Your Impact Hub Nairobi account has been deleted",
    html: layoutEmail({
      preheader: "Account permanently deleted",
      title: "Account deleted",
      eyebrow: "Account",
      bodyHtml,
    }),
    text: [
      intro,
      "Your profile, sign-in access, bookings, and personal data tied to this account have been removed.",
      "If you did not request this, contact our team immediately.",
    ].join("\n\n"),
  })
}

export async function sendVisitorRegisteredEmail(params: {
  to: string
  hostName?: string | null
  visitorName: string
  expectedAt: Date
  dashboardUrl?: string
}): Promise<SendEmailResult> {
  const when = params.expectedAt.toLocaleString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
  const appUrl = getAppBaseUrl()

  const bodyHtml = `
    ${emailGreeting(params.hostName)}
    ${emailParagraph(`<strong>${escapeHtml(params.visitorName)}</strong> has been registered as your visitor.`)}
    ${emailDetailCard(
      [
        { label: "Guest", value: escapeHtml(params.visitorName) },
        { label: "Expected", value: escapeHtml(when) },
      ],
      { title: "Visitor details" }
    )}
    ${emailMutedNote("Reception will see this on the front-desk list when your guest arrives.")}
  `

  return sendEmail({
    to: params.to,
    subject: "Impact Hub Nairobi — Visitor registered",
    html: layoutEmail({
      preheader: `${params.visitorName} is expected soon`,
      title: "Visitor registered",
      eyebrow: "Front desk",
      bodyHtml,
      ctaLabel: "View dashboard",
      ctaUrl: params.dashboardUrl ?? `${appUrl}/dashboard/visitors`,
    }),
    text: `Visitor ${params.visitorName} expected on ${when}.`,
  })
}

export async function sendVisitorRegisteredStaffEmail(params: {
  visitorName: string
  hostName?: string | null
  hostEmail?: string | null
  expectedAt: Date
  locationName?: string | null
  company?: string | null
  purpose?: string | null
  registeredBy: "member" | "admin"
  frontDeskUrl?: string
}): Promise<SendEmailResult> {
  const when = formatHubDateTime(params.expectedAt)
  const hostLabel = params.hostName
    ? `${params.hostName}${params.hostEmail ? ` (${params.hostEmail})` : ""}`
    : params.hostEmail || "Unknown host"
  const registeredByLabel =
    params.registeredBy === "member" ? "Member pre-registration" : "Front desk walk-in"

  const rows = [
    { label: "Guest", value: escapeHtml(params.visitorName) },
    { label: "Host", value: escapeHtml(hostLabel) },
    { label: "Expected", value: escapeHtml(when) },
  ]
  if (params.locationName) rows.push({ label: "Hub", value: escapeHtml(params.locationName) })
  if (params.company) rows.push({ label: "Company", value: escapeHtml(params.company) })
  if (params.purpose) rows.push({ label: "Purpose", value: escapeHtml(params.purpose) })

  const bodyHtml = `
    ${emailParagraph(`A new visitor has been registered via <strong>${escapeHtml(registeredByLabel)}</strong>.`)}
    ${emailDetailCard(rows, { title: "Front desk alert" })}
    ${emailMutedNote("Please have reception ready for this guest at the expected time.")}
  `

  return sendEmail({
    to: getEmailStaffTo(),
    subject: `[Front desk] Visitor registered — ${params.visitorName}`,
    html: layoutEmail({
      preheader: `${params.visitorName} expected ${when}`,
      title: "New visitor registered",
      eyebrow: "Front desk",
      bodyHtml,
      ctaLabel: params.frontDeskUrl ? "Open front desk" : undefined,
      ctaUrl: params.frontDeskUrl || undefined,
    }),
    text: `New visitor: ${params.visitorName}\nHost: ${hostLabel}\nExpected: ${when}`,
  })
}

export async function sendInvoiceReminderEmail(params: {
  to: string
  name?: string | null
  invoiceNumber: string
  amount: number
  currency: string
  dueDate?: Date | null
  isOverdue: boolean
  billingUrl: string
}): Promise<SendEmailResult> {
  const dueStr = params.dueDate
    ? params.dueDate.toLocaleDateString("en-KE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "soon"
  const title = params.isOverdue ? "Invoice overdue" : "Invoice due soon"
  const amountLabel = `${params.currency} ${params.amount.toLocaleString("en-KE")}`

  const bodyHtml = `
    ${emailGreeting(params.name)}
    ${emailParagraph(
      params.isOverdue
        ? `Your invoice is <strong>overdue</strong>. Please settle it at your earliest convenience to keep your membership in good standing.`
        : `This is a friendly reminder that your invoice is due on <strong>${escapeHtml(dueStr)}</strong>.`
    )}
    ${emailDetailCard(
      [
        { label: "Invoice", value: escapeHtml(params.invoiceNumber) },
        { label: "Amount", value: escapeHtml(amountLabel) },
        { label: "Due", value: escapeHtml(params.isOverdue ? "Overdue" : dueStr) },
      ],
      { title: "Billing summary" }
    )}
  `

  return sendEmail({
    to: params.to,
    subject: `Impact Hub Nairobi — ${title}`,
    html: layoutEmail({
      preheader: `Invoice ${params.invoiceNumber}`,
      title,
      eyebrow: "Billing",
      bodyHtml,
      ctaLabel: "View billing",
      ctaUrl: params.billingUrl,
    }),
    text: `Invoice ${params.invoiceNumber} (${amountLabel}) is ${params.isOverdue ? "overdue" : `due on ${dueStr}`}. ${params.billingUrl}`,
  })
}

export async function sendSubscriptionRenewalReminderEmail(params: {
  to: string
  name?: string | null
  planName: string
  renewsOn: Date
  billingUrl: string
}): Promise<SendEmailResult> {
  const renewStr = params.renewsOn.toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const bodyHtml = `
    ${emailGreeting(params.name)}
    ${emailParagraph(`Your <strong>${escapeHtml(params.planName)}</strong> membership at Impact Hub Nairobi renews soon.`)}
    ${emailDetailCard(
      [
        { label: "Plan", value: escapeHtml(params.planName) },
        { label: "Renews", value: escapeHtml(renewStr) },
      ],
      { title: "Membership" }
    )}
    ${emailMutedNote("Update your payment method or manage renewal settings anytime from billing.")}
  `

  return sendEmail({
    to: params.to,
    subject: "Impact Hub Nairobi — Membership renewal reminder",
    html: layoutEmail({
      preheader: `Renews on ${renewStr}`,
      title: "Membership renewing soon",
      eyebrow: "Billing",
      bodyHtml,
      ctaLabel: "Manage billing",
      ctaUrl: params.billingUrl,
    }),
    text: `Your ${params.planName} membership renews on ${renewStr}. ${params.billingUrl}`,
  })
}
