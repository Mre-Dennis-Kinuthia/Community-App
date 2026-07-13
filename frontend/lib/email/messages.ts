import {
  formatBookingDate,
  formatBookingTimeRange,
  formatResourceType,
} from "@/lib/booking-format"
import { formatBookingAddOnsHtml, formatBookingAddOnsPlainText } from "@/lib/booking-add-ons"
import { getAppBaseUrl, getDashboardBookingUrl, getNewsArticleUrl, getNewsletterUnsubscribeUrl } from "@/lib/app-url"
import { formatHubDateTime } from "@/lib/space/hub-timezone"
import { formatEventWhen, layoutEmail, escapeHtml, emailGreeting, emailParagraph, emailDetailCard, emailMutedNote, emailHighlightBox, emailUnsubscribeFooter } from "./templates"
import { getEmailStaffTo } from "./config"
import { sendEmail, type EmailAttachment, type SendEmailResult } from "./send"
import { sendFromTemplate, type SendFromTemplateResult } from "./resolve-template"

function asSendResult(result: SendFromTemplateResult): SendEmailResult {
  if ("skipped" in result && result.skipped) {
    return { ok: true, id: `skipped:${result.reason}` }
  }
  return result
}

export async function sendPasswordResetEmail(params: {
  to: string
  resetUrl: string
  name?: string | null
  initiatedByAdmin?: boolean
}): Promise<SendEmailResult> {
  const intro = params.initiatedByAdmin
    ? "An <strong>Impact Hub Nairobi</strong> administrator sent you a link to reset your community platform password."
    : "You requested a password reset for your <strong>Impact Hub Nairobi</strong> account."

  return asSendResult(
    await sendFromTemplate({
      key: "password_reset",
      to: params.to,
      name: params.name,
      vars: { intro, resetUrl: params.resetUrl },
      ctaUrl: params.resetUrl,
    })
  )
}

export async function sendEmailVerificationEmail(params: {
  to: string
  verifyUrl: string
  name?: string | null
}): Promise<SendEmailResult> {
  return asSendResult(
    await sendFromTemplate({
      key: "email_verification",
      to: params.to,
      name: params.name,
      vars: { verifyUrl: params.verifyUrl },
      ctaUrl: params.verifyUrl,
    })
  )
}

export async function sendConnectionRequestEmail(params: {
  to: string
  name?: string | null
  fromName: string
  profileUrl: string
}): Promise<SendEmailResult> {
  const fromName = params.fromName.trim() || "A community member"
  return asSendResult(
    await sendFromTemplate({
      key: "connection_request",
      to: params.to,
      name: params.name,
      vars: {
        fromName,
        message: "",
        actionUrl: params.profileUrl,
      },
      afterDetailsHtml: emailHighlightBox(
        "Accept the request to message each other and explore collaboration across programs, events, and the member directory."
      ),
      ctaUrl: params.profileUrl,
    })
  )
}

export async function sendConnectedMemberMessageEmail(params: {
  to: string
  toName?: string | null
  fromName: string
  fromEmail: string
  subject: string
  message: string
  senderProfileUrl: string
}): Promise<SendEmailResult> {
  const senderName = escapeHtml(params.fromName.trim() || "A community member")
  const subjectLine = params.subject.trim()
  const messageHtml = escapeHtml(params.message.trim()).replace(/\n/g, "<br>")
  const bodyHtml = `
    ${emailGreeting(params.toName)}
    ${emailParagraph(
      `<strong>${senderName}</strong> sent you a message through <strong>Impact Hub Nairobi</strong>.`
    )}
    ${emailDetailCard(
      [{ label: "Subject", value: escapeHtml(subjectLine) }],
      { title: "Message" }
    )}
    ${emailHighlightBox(messageHtml)}
    ${emailMutedNote("Reply to this email to respond directly to the sender.")}
  `

  return sendEmail({
    to: params.to,
    replyTo: params.fromEmail,
    subject: `${params.fromName.trim() || "A member"}: ${subjectLine}`,
    html: layoutEmail({
      preheader: `Message from ${params.fromName.trim() || "a member"}`,
      title: "Message from your connection",
      eyebrow: "Community",
      bodyHtml,
      ctaLabel: "View profile",
      ctaUrl: params.senderProfileUrl,
    }),
    text: [
      `${params.fromName.trim() || "A community member"} sent you a message on Impact Hub Nairobi.`,
      "",
      `Subject: ${subjectLine}`,
      "",
      params.message.trim(),
      "",
      `View their profile: ${params.senderProfileUrl}`,
      "",
      "Reply to this email to respond directly.",
    ].join("\n"),
    emailCategory: "community",
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
  const key =
    params.status === "pending"
      ? "event_registration_pending"
      : params.status === "waitlisted"
        ? "event_registration_waitlisted"
        : "event_registration_confirmed"

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

  return asSendResult(
    await sendFromTemplate({
      key,
      to: params.to,
      name: params.name,
      vars: {
        eventTitle: params.eventTitle,
        when,
        eventUrl: params.eventUrl,
      },
      detailsHtml: emailDetailCard(
        [
          { label: "Event", value: escapeHtml(params.eventTitle) },
          { label: "When", value: escapeHtml(when) },
        ],
        { title: "Event details" }
      ),
      ctaUrl: params.eventUrl,
      attachments,
    })
  )
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
  const key =
    params.decision === "rejected"
      ? "event_application_rejected"
      : params.decision === "promoted"
        ? "event_application_promoted"
        : "event_application_approved"

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

  return asSendResult(
    await sendFromTemplate({
      key,
      to: params.to,
      name: params.name,
      vars: {
        eventTitle: params.eventTitle,
        when,
        eventUrl: params.eventUrl,
      },
      detailsHtml: emailDetailCard(
        [
          { label: "Event", value: escapeHtml(params.eventTitle) },
          { label: "When", value: escapeHtml(when) },
        ],
        { title: "Event details" }
      ),
      ctaUrl: params.eventUrl,
      attachments,
    })
  )
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
    emailCategory: "events",
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

  return asSendResult(
    await sendFromTemplate({
      key: "event_reminder",
      to: params.to,
      name: params.name,
      vars: {
        eventTitle: params.eventTitle,
        when,
        eventUrl: params.eventUrl,
      },
      detailsHtml: emailDetailCard(
        [
          { label: "Event", value: escapeHtml(params.eventTitle) },
          { label: "When", value: escapeHtml(when) },
        ],
        { title: "Event details" }
      ),
      ctaUrl: params.eventUrl,
    })
  )
}

export async function sendWorkspaceInquiryConfirmationEmail(params: {
  to: string
  name: string
  inquiryLabel: string
}): Promise<SendEmailResult> {
  return asSendResult(
    await sendFromTemplate({
      key: "workspace_inquiry_confirmation",
      to: params.to,
      name: params.name,
      vars: { inquiryLabel: params.inquiryLabel },
    })
  )
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
  const total = `KES ${params.totalPrice.toLocaleString("en-KE")}`
  const calendarNote =
    isMeetingRoom && params.calendarInvite
      ? " A calendar invite is attached — open it to add the booking to your calendar."
      : ""

  const detailRows = [
    { label: "Space", value: escapeHtml(resource) },
    { label: "Date", value: escapeHtml(when) },
    { label: "Time", value: escapeHtml(time) },
    { label: "Total", value: total },
  ]

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

  const afterDetailsHtml = `${addOnsHtml}${
    (params.membershipDiscount ?? 0) > 0
      ? emailMutedNote(
          `Membership benefit applied: −KES ${params.membershipDiscount!.toLocaleString("en-KE")}`
        )
      : ""
  }`

  return asSendResult(
    await sendFromTemplate({
      key: "booking_confirmation",
      to: params.to,
      name: params.name,
      vars: {
        resource,
        date: when,
        time,
        total,
        bookingUrl,
        calendarNote,
      },
      detailsHtml: emailDetailCard(detailRows, { title: "Booking details" }),
      afterDetailsHtml,
      ctaUrl: bookingUrl,
      attachments,
    })
  )
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

  return asSendResult(
    await sendFromTemplate({
      key: "booking_cancelled",
      to: params.to,
      name: params.name,
      vars: { resource, date: when, time, bookingsUrl },
      detailsHtml: emailDetailCard(
        [
          { label: "Space", value: escapeHtml(resource) },
          { label: "Date", value: escapeHtml(when) },
          { label: "Time", value: escapeHtml(time) },
        ],
        { title: "Cancelled booking" }
      ),
      ctaUrl: bookingsUrl,
    })
  )
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
  const browseUrl = `${getAppBaseUrl()}/events`

  return asSendResult(
    await sendFromTemplate({
      key: "event_registration_cancelled",
      to: params.to,
      name: params.name,
      vars: {
        eventTitle: params.eventTitle,
        when,
        eventUrl: params.eventUrl || browseUrl,
      },
      detailsHtml: emailDetailCard(
        [
          { label: "Event", value: escapeHtml(params.eventTitle) },
          { label: "When", value: escapeHtml(when) },
        ],
        { title: "Event details" }
      ),
      ctaUrl: browseUrl,
    })
  )
}

export async function sendWelcomeEmail(params: {
  to: string
  name?: string | null
}): Promise<SendEmailResult> {
  const onboardingUrl = `${getAppBaseUrl()}/onboarding`

  return asSendResult(
    await sendFromTemplate({
      key: "welcome",
      to: params.to,
      name: params.name,
      vars: { onboardingUrl },
      detailsHtml: emailDetailCard(
        [
          { label: "Programs", value: "Workshops & acceleration" },
          { label: "Workspace", value: "Flexible coworking in Nairobi" },
          { label: "Community", value: "300k+ global Impact Hub network" },
        ],
        { title: "What you can do here" }
      ),
      ctaUrl: onboardingUrl,
    })
  )
}

export async function sendOnboardingReminderEmail(params: {
  to: string
  name?: string | null
}): Promise<SendEmailResult> {
  const onboardingUrl = `${getAppBaseUrl()}/onboarding`

  return asSendResult(
    await sendFromTemplate({
      key: "onboarding_reminder",
      to: params.to,
      name: params.name,
      vars: { onboardingUrl },
      ctaUrl: onboardingUrl,
    })
  )
}

export async function sendNewsletterSubscribeEmail(params: {
  to: string
  unsubscribeToken?: string
}): Promise<SendEmailResult> {
  const appUrl = getAppBaseUrl()
  const unsubscribeUrl = params.unsubscribeToken
    ? getNewsletterUnsubscribeUrl(params.unsubscribeToken)
    : undefined

  const bodyHtml = `
    ${emailGreeting()}
    ${emailParagraph("Thanks for subscribing to <strong>Impact Hub Nairobi</strong> updates.")}
    ${emailParagraph("You'll hear about upcoming events, programs, and community news from Nairobi's impact ecosystem.")}
  `

  return sendEmail({
    to: params.to,
    subject: "You're subscribed to Impact Hub Nairobi",
    html: layoutEmail({
      preheader: "Subscription confirmed",
      title: "Welcome to our newsletter",
      eyebrow: "Newsletter",
      bodyHtml,
      ctaLabel: "Explore events",
      ctaUrl: `${appUrl}/events/public`,
      footerExtraHtml: unsubscribeUrl ? emailUnsubscribeFooter(unsubscribeUrl) : undefined,
    }),
    text: `Thanks for subscribing to Impact Hub Nairobi updates.\n${appUrl}${unsubscribeUrl ? `\nUnsubscribe: ${unsubscribeUrl}` : ""}`,
    emailCategory: "requests",
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
  const excerpt = params.excerpt?.trim() || ""

  return asSendResult(
    await sendFromTemplate({
      key: "news_article",
      to: params.to,
      name: params.name,
      vars: {
        articleTitle: params.title,
        excerpt,
        articleUrl,
      },
      detailsHtml: emailDetailCard(
        [
          { label: "Article", value: escapeHtml(params.title) },
          ...(excerpt ? [{ label: "Preview", value: escapeHtml(excerpt) }] : []),
        ],
        { title: "Community news" }
      ),
      ctaUrl: articleUrl,
    })
  )
}

async function sendStaffAlertEmail(params: {
  subject: string
  title: string
  bodyHtml: string
  text: string
  replyTo?: string
  eyebrow?: string
  emailCategory?: string
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
    emailCategory: params.emailCategory ?? "admin",
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
    emailCategory: "bookings",
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
    emailCategory: "requests",
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
    emailCategory: "events",
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
    emailCategory: "requests",
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
    emailCategory: "requests",
  })
}

export async function sendAccountDeletedEmail(params: {
  to: string
  name?: string | null
  deletedBy?: "self" | "admin"
}): Promise<SendEmailResult> {
  return asSendResult(
    await sendFromTemplate({
      key: "account_deleted",
      to: params.to,
      name: params.name,
      vars: {},
    })
  )
}

export async function sendVisitorRegisteredEmail(params: {
  to: string
  hostName?: string | null
  visitorName: string
  expectedAt: Date
  dashboardUrl?: string
}): Promise<SendEmailResult> {
  const when = formatHubDateTime(params.expectedAt)
  const ctaUrl = params.dashboardUrl ?? `${getAppBaseUrl()}/dashboard/visitors`

  return asSendResult(
    await sendFromTemplate({
      key: "visitor_registered",
      to: params.to,
      name: params.hostName,
      vars: {
        visitorName: params.visitorName,
        visitDate: when,
        purpose: "",
      },
      detailsHtml: emailDetailCard(
        [
          { label: "Guest", value: escapeHtml(params.visitorName) },
          { label: "Expected", value: escapeHtml(when) },
        ],
        { title: "Visitor details" }
      ),
      ctaUrl,
    })
  )
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
    emailCategory: "space",
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
  const amountLabel = `${params.currency} ${params.amount.toLocaleString("en-KE")}`

  return asSendResult(
    await sendFromTemplate({
      key: "invoice_reminder",
      to: params.to,
      name: params.name,
      vars: {
        invoiceLabel: params.invoiceNumber,
        amount: amountLabel,
        dueDate: params.isOverdue ? "Overdue" : dueStr,
        billingUrl: params.billingUrl,
      },
      detailsHtml: emailDetailCard(
        [
          { label: "Invoice", value: escapeHtml(params.invoiceNumber) },
          { label: "Amount", value: escapeHtml(amountLabel) },
          { label: "Due", value: escapeHtml(params.isOverdue ? "Overdue" : dueStr) },
        ],
        { title: "Billing summary" }
      ),
      ctaUrl: params.billingUrl,
    })
  )
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

  return asSendResult(
    await sendFromTemplate({
      key: "subscription_renewal_reminder",
      to: params.to,
      name: params.name,
      vars: {
        planName: params.planName,
        renewalDate: renewStr,
        billingUrl: params.billingUrl,
      },
      detailsHtml: emailDetailCard(
        [
          { label: "Plan", value: escapeHtml(params.planName) },
          { label: "Renews", value: escapeHtml(renewStr) },
        ],
        { title: "Membership" }
      ),
      ctaUrl: params.billingUrl,
    })
  )
}
