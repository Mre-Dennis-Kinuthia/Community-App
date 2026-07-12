/**
 * Catalog of automated member emails editable from the admin platform.
 * Code defaults are the source of truth until an admin saves a DB override.
 */

export type EmailTemplateCategory =
  | "account"
  | "bookings"
  | "events"
  | "membership"
  | "space"
  | "news"
  | "community"
  | "billing"
  | "admin"

export type EmailTemplateVariable = {
  key: string
  label: string
  sample: string
}

export type EmailTemplateDefinition = {
  key: string
  name: string
  description: string
  category: EmailTemplateCategory
  /** Variables available for {{placeholders}} in subject/body/text */
  variables: EmailTemplateVariable[]
  subject: string
  preheader: string
  title: string
  eyebrow: string
  /** HTML fragments (paragraphs). Use {{var}} placeholders. Greeting is prepended automatically. */
  bodyHtml: string
  ctaLabel: string | null
  textBody: string
  /** Which app primarily sends this email */
  sentFrom: "admin" | "member" | "both"
}

const NAME: EmailTemplateVariable = {
  key: "name",
  label: "Member name",
  sample: "Jane Doe",
}

export const EMAIL_TEMPLATE_CATALOG: EmailTemplateDefinition[] = [
  {
    key: "welcome",
    name: "Welcome",
    description: "Sent when a new member registers or accepts an invite.",
    category: "account",
    sentFrom: "member",
    variables: [NAME, { key: "onboardingUrl", label: "Onboarding URL", sample: "https://example.com/onboarding" }],
    subject: "Welcome to Impact Hub Nairobi — complete your profile",
    preheader: "For impact startups & innovators",
    title: "Welcome to the community",
    eyebrow: "Become a member",
    bodyHtml: `<p>Welcome to <strong>Impact Hub Nairobi</strong> — where impact startups, partners, and innovators connect, learn, and build together.</p>
<p>Complete your profile to unlock the community directory, events, workspace booking, and programs tailored to your goals.</p>`,
    ctaLabel: "Complete your profile",
    textBody: "Welcome to Impact Hub Nairobi!\nComplete your profile: {{onboardingUrl}}",
  },
  {
    key: "onboarding_reminder",
    name: "Onboarding reminder",
    description: "Reminds members who have not finished onboarding.",
    category: "account",
    sentFrom: "member",
    variables: [NAME, { key: "onboardingUrl", label: "Onboarding URL", sample: "https://example.com/onboarding" }],
    subject: "Finish setting up your Impact Hub Nairobi profile",
    preheader: "Complete onboarding in a few minutes",
    title: "You're almost there",
    eyebrow: "Become a member",
    bodyHtml: `<p>You created your <strong>Impact Hub Nairobi</strong> account — thank you for joining our community of impact makers.</p>
<p>Your profile is almost ready. Finish onboarding to appear in the directory, register for events, and book workspace.</p>
<p><em>It only takes a few minutes — tell us about your venture, sector, and what you're looking for in the community.</em></p>`,
    ctaLabel: "Continue onboarding",
    textBody: "Finish your Impact Hub Nairobi profile: {{onboardingUrl}}",
  },
  {
    key: "password_reset",
    name: "Password reset",
    description: "Sent when a member or admin requests a password reset.",
    category: "account",
    sentFrom: "both",
    variables: [
      NAME,
      { key: "resetUrl", label: "Reset URL", sample: "https://example.com/reset" },
      {
        key: "intro",
        label: "Intro sentence (HTML)",
        sample:
          "You requested a password reset for your <strong>Impact Hub Nairobi</strong> account.",
      },
    ],
    subject: "Reset your Impact Hub Nairobi password",
    preheader: "Password reset link",
    title: "Reset your password",
    eyebrow: "Account",
    bodyHtml: `<p>{{intro}}</p>
<p style="color:#71717A;font-size:13px;">If you did not expect this, you can safely ignore this email. The link expires in 1 hour.</p>`,
    ctaLabel: "Reset password",
    textBody: "Reset your password: {{resetUrl}}\nThis link expires in 1 hour.",
  },
  {
    key: "member_platform_invite",
    name: "Member platform invite",
    description: "Invite a member to create their password and join the platform.",
    category: "account",
    sentFrom: "admin",
    variables: [
      NAME,
      { key: "inviteUrl", label: "Invite URL", sample: "https://example.com/invite" },
      { key: "invitedBy", label: "Invited by", sample: "Alex from Impact Hub" },
    ],
    subject: "You're invited to Impact Hub Nairobi",
    preheader: "Join the community platform",
    title: "Community platform invite",
    eyebrow: "Members",
    bodyHtml: `<p>{{invitedBy}} invited you to join the <strong>Impact Hub Nairobi</strong> community platform.</p>
<p>Create your password to access member booking, events, community connections, and more.</p>
<p style="color:#71717A;font-size:13px;">This link expires in 7 days. If you were not expecting this invite, you can ignore this email.</p>`,
    ctaLabel: "Create your password",
    textBody:
      "You were invited to join Impact Hub Nairobi.\n\nCreate your password: {{inviteUrl}}\n\nThis link expires in 7 days.",
  },
  {
    key: "account_deleted",
    name: "Account deleted",
    description: "Confirmation after a member account is deleted.",
    category: "account",
    sentFrom: "both",
    variables: [NAME],
    subject: "Your Impact Hub Nairobi account has been deleted",
    preheader: "Account deleted",
    title: "Account deleted",
    eyebrow: "Account",
    bodyHtml: `<p>Your Impact Hub Nairobi community account has been deleted as requested.</p>
<p style="color:#71717A;font-size:13px;">If you did not expect this, please contact our team.</p>`,
    ctaLabel: null,
    textBody: "Your Impact Hub Nairobi account has been deleted.",
  },
  {
    key: "booking_confirmation",
    name: "Booking confirmation",
    description: "Sent when a member confirms a workspace booking.",
    category: "bookings",
    sentFrom: "member",
    variables: [
      NAME,
      { key: "resource", label: "Space type", sample: "Meeting room" },
      { key: "date", label: "Date", sample: "Monday, 14 July 2026" },
      { key: "time", label: "Time", sample: "09:00 – 11:00" },
      { key: "total", label: "Total", sample: "KES 5,000" },
      { key: "bookingUrl", label: "Booking URL", sample: "https://example.com/bookings/1" },
      {
        key: "calendarNote",
        label: "Calendar note (optional HTML)",
        sample: " A calendar invite is attached — open it to add the booking to your calendar.",
      },
    ],
    subject: "Booking confirmed — {{resource}}",
    preheader: "Your booking is confirmed",
    title: "Booking confirmed",
    eyebrow: "Workspace",
    bodyHtml: `<p>Your workspace booking is confirmed.{{calendarNote}}</p>`,
    ctaLabel: "View booking",
    textBody:
      "Booking confirmed\n{{resource}}\n{{date}}\n{{time}}\nTotal: {{total}}\n{{bookingUrl}}",
  },
  {
    key: "booking_cancelled",
    name: "Booking cancelled",
    description: "Sent when a booking is cancelled by a member or admin.",
    category: "bookings",
    sentFrom: "both",
    variables: [
      NAME,
      { key: "resource", label: "Space type", sample: "Meeting room" },
      { key: "date", label: "Date", sample: "Monday, 14 July 2026" },
      { key: "time", label: "Time", sample: "09:00 – 11:00" },
      { key: "bookingsUrl", label: "Bookings URL", sample: "https://example.com/dashboard/bookings" },
    ],
    subject: "Booking cancelled — {{resource}}",
    preheader: "Your booking was cancelled",
    title: "Booking cancelled",
    eyebrow: "Workspace",
    bodyHtml: `<p>Your workspace booking has been cancelled.</p>
<p style="color:#71717A;font-size:13px;">If you have questions, reply to this email or contact our team.</p>`,
    ctaLabel: "My bookings",
    textBody: "Booking cancelled\n{{resource}}\n{{date}}\n{{time}}\n{{bookingsUrl}}",
  },
  {
    key: "workspace_inquiry_confirmation",
    name: "Workspace inquiry confirmation",
    description: "Confirms a workspace inquiry was received.",
    category: "bookings",
    sentFrom: "member",
    variables: [
      NAME,
      { key: "inquiryLabel", label: "Inquiry type", sample: "private office" },
    ],
    subject: "We received your workspace inquiry",
    preheader: "Inquiry received",
    title: "Thank you for your inquiry",
    eyebrow: "Workspace",
    bodyHtml: `<p>We received your <strong>{{inquiryLabel}}</strong> request.</p>
<p>Our team will contact you shortly to discuss availability and pricing.</p>`,
    ctaLabel: null,
    textBody:
      "We received your {{inquiryLabel}} request. Our team will contact you soon.",
  },
  {
    key: "event_registration_confirmed",
    name: "Event registration confirmed",
    description: "Sent when a member is confirmed for an event.",
    category: "events",
    sentFrom: "member",
    variables: [
      NAME,
      { key: "eventTitle", label: "Event title", sample: "Climate Innovation Meetup" },
      { key: "when", label: "Event date/time", sample: "Tuesday, 15 July 2026 at 5:00 PM" },
      { key: "eventUrl", label: "Event URL", sample: "https://example.com/events/1" },
    ],
    subject: "You're registered — {{eventTitle}}",
    preheader: "You're in!",
    title: "You're in!",
    eyebrow: "Events",
    bodyHtml: `<p>You're confirmed for this Impact Hub Nairobi event. A calendar invite is attached — add it to Google Calendar, Apple Calendar, or Outlook.</p>`,
    ctaLabel: "View event",
    textBody: "You're in!\n{{eventTitle}}\n{{when}}\n{{eventUrl}}",
  },
  {
    key: "event_registration_waitlisted",
    name: "Event waitlist confirmation",
    description: "Sent when a member is placed on an event waitlist.",
    category: "events",
    sentFrom: "member",
    variables: [
      NAME,
      { key: "eventTitle", label: "Event title", sample: "Climate Innovation Meetup" },
      { key: "when", label: "Event date/time", sample: "Tuesday, 15 July 2026 at 5:00 PM" },
      { key: "eventUrl", label: "Event URL", sample: "https://example.com/events/1" },
    ],
    subject: "Waitlist confirmation — {{eventTitle}}",
    preheader: "You are on the waitlist",
    title: "You are on the waitlist",
    eyebrow: "Events",
    bodyHtml: `<p>The event is currently full. We will notify you if a spot opens up.</p>`,
    ctaLabel: "View event",
    textBody: "You are on the waitlist\n{{eventTitle}}\n{{when}}\n{{eventUrl}}",
  },
  {
    key: "event_registration_pending",
    name: "Event application received",
    description: "Sent when an event registration needs organizer approval.",
    category: "events",
    sentFrom: "member",
    variables: [
      NAME,
      { key: "eventTitle", label: "Event title", sample: "Climate Innovation Meetup" },
      { key: "when", label: "Event date/time", sample: "Tuesday, 15 July 2026 at 5:00 PM" },
      { key: "eventUrl", label: "Event URL", sample: "https://example.com/events/1" },
    ],
    subject: "Application received — {{eventTitle}}",
    preheader: "Application submitted",
    title: "Application submitted",
    eyebrow: "Events",
    bodyHtml: `<p>Your registration is pending organizer approval. We will email you when it is reviewed.</p>`,
    ctaLabel: "View event",
    textBody: "Application submitted\n{{eventTitle}}\n{{when}}\n{{eventUrl}}",
  },
  {
    key: "event_application_approved",
    name: "Event application approved",
    description: "Sent when an admin approves an event application.",
    category: "events",
    sentFrom: "both",
    variables: [
      NAME,
      { key: "eventTitle", label: "Event title", sample: "Climate Innovation Meetup" },
      { key: "when", label: "Event date/time", sample: "Tuesday, 15 July 2026 at 5:00 PM" },
      { key: "eventUrl", label: "Event URL", sample: "https://example.com/events/1" },
    ],
    subject: "You're approved — {{eventTitle}}",
    preheader: "Application approved",
    title: "You're approved",
    eyebrow: "Events",
    bodyHtml: `<p>Your application was approved. A calendar invite is attached — open it to add the event to your calendar.</p>`,
    ctaLabel: "View event",
    textBody: "You're approved\n{{eventTitle}}\n{{when}}\n{{eventUrl}}",
  },
  {
    key: "event_application_rejected",
    name: "Event application not approved",
    description: "Sent when an admin rejects an event application.",
    category: "events",
    sentFrom: "both",
    variables: [
      NAME,
      { key: "eventTitle", label: "Event title", sample: "Climate Innovation Meetup" },
      { key: "when", label: "Event date/time", sample: "Tuesday, 15 July 2026 at 5:00 PM" },
      { key: "eventUrl", label: "Event URL", sample: "https://example.com/events/1" },
    ],
    subject: "Application update — {{eventTitle}}",
    preheader: "Application not approved",
    title: "Application not approved",
    eyebrow: "Events",
    bodyHtml: `<p>Unfortunately your application was not approved for this event. Contact the organizer if you have questions.</p>`,
    ctaLabel: "View event",
    textBody: "Application not approved\n{{eventTitle}}\n{{when}}\n{{eventUrl}}",
  },
  {
    key: "event_application_promoted",
    name: "Event waitlist promoted",
    description: "Sent when a waitlisted member gets a spot.",
    category: "events",
    sentFrom: "both",
    variables: [
      NAME,
      { key: "eventTitle", label: "Event title", sample: "Climate Innovation Meetup" },
      { key: "when", label: "Event date/time", sample: "Tuesday, 15 July 2026 at 5:00 PM" },
      { key: "eventUrl", label: "Event URL", sample: "https://example.com/events/1" },
    ],
    subject: "Spot available — {{eventTitle}}",
    preheader: "You are now registered",
    title: "You are now registered",
    eyebrow: "Events",
    bodyHtml: `<p>A spot opened up and you have been moved from the waitlist. A calendar invite is attached — open it to add the event to your calendar.</p>`,
    ctaLabel: "View event",
    textBody: "You are now registered\n{{eventTitle}}\n{{when}}\n{{eventUrl}}",
  },
  {
    key: "event_reminder",
    name: "Event reminder",
    description: "Automated reminder before an event starts.",
    category: "events",
    sentFrom: "both",
    variables: [
      NAME,
      { key: "eventTitle", label: "Event title", sample: "Climate Innovation Meetup" },
      { key: "when", label: "Event date/time", sample: "Tuesday, 15 July 2026 at 5:00 PM" },
      { key: "eventUrl", label: "Event URL", sample: "https://example.com/events/1" },
    ],
    subject: "Reminder: {{eventTitle}} is coming up",
    preheader: "Event reminder",
    title: "See you soon",
    eyebrow: "Events",
    bodyHtml: `<p>This is a friendly reminder about your upcoming Impact Hub Nairobi event.</p>`,
    ctaLabel: "View event",
    textBody: "Reminder: {{eventTitle}}\n{{when}}\n{{eventUrl}}",
  },
  {
    key: "event_registration_cancelled",
    name: "Event registration cancelled",
    description: "Sent when a member cancels their event registration.",
    category: "events",
    sentFrom: "member",
    variables: [
      NAME,
      { key: "eventTitle", label: "Event title", sample: "Climate Innovation Meetup" },
      { key: "when", label: "Event date/time", sample: "Tuesday, 15 July 2026 at 5:00 PM" },
      { key: "eventUrl", label: "Event URL", sample: "https://example.com/events/1" },
    ],
    subject: "Registration cancelled — {{eventTitle}}",
    preheader: "Registration cancelled",
    title: "Registration cancelled",
    eyebrow: "Events",
    bodyHtml: `<p>Your registration for this event has been cancelled.</p>`,
    ctaLabel: "Browse events",
    textBody: "Registration cancelled\n{{eventTitle}}\n{{when}}\n{{eventUrl}}",
  },
  {
    key: "membership_activated",
    name: "Membership activated",
    description: "Sent when a membership payment is confirmed.",
    category: "membership",
    sentFrom: "both",
    variables: [
      NAME,
      { key: "planName", label: "Plan name", sample: "Community Member" },
      { key: "periodEnd", label: "Active until", sample: "14 July 2027" },
      { key: "billingUrl", label: "Billing URL", sample: "https://example.com/billing" },
    ],
    subject: "Membership active — {{planName}}",
    preheader: "Your membership is active",
    title: "Welcome aboard",
    eyebrow: "Membership",
    bodyHtml: `<p>Your <strong>{{planName}}</strong> membership at Impact Hub Nairobi is now active.</p>
<p style="color:#71717A;font-size:13px;">Manage your plan, invoices, and renewal settings anytime from billing.</p>`,
    ctaLabel: "View billing",
    textBody:
      "Your {{planName}} membership is active until {{periodEnd}}. Billing: {{billingUrl}}",
  },
  {
    key: "membership_payment_link",
    name: "Membership payment link",
    description: "Invite someone to pay for a membership plan.",
    category: "membership",
    sentFrom: "both",
    variables: [
      NAME,
      { key: "planName", label: "Plan name", sample: "Community Member" },
      { key: "amountLabel", label: "Amount", sample: "KES 15,000" },
      { key: "intervalLabel", label: "Billing interval", sample: "month" },
      { key: "expires", label: "Link expiry", sample: "21 July 2026" },
      { key: "payUrl", label: "Payment URL", sample: "https://example.com/pay" },
      { key: "adminNoteHtml", label: "Admin note (HTML, optional)", sample: "" },
    ],
    subject: "Complete your membership — {{planName}}",
    preheader: "Pay {{amountLabel}} for {{planName}}",
    title: "Membership payment",
    eyebrow: "Membership",
    bodyHtml: `<p>Complete your <strong>{{planName}}</strong> membership at Impact Hub Nairobi.</p>
{{adminNoteHtml}}
<p style="color:#71717A;font-size:13px;">Use the same email address this message was sent to when paying.</p>`,
    ctaLabel: "Pay membership",
    textBody: "Pay {{amountLabel}} for {{planName}}: {{payUrl}}\nExpires: {{expires}}",
  },
  {
    key: "star_connect_approved",
    name: "Star Connect approved",
    description: "Sent when a Star Connect membership request is approved.",
    category: "membership",
    sentFrom: "admin",
    variables: [
      NAME,
      { key: "billingUrl", label: "Billing URL", sample: "https://example.com/billing" },
    ],
    subject: "Your Star Connect membership is approved",
    preheader: "Star Connect approved",
    title: "You're approved",
    eyebrow: "Membership",
    bodyHtml: `<p>Your Star Connect membership request has been approved. You can now complete payment and activate your membership.</p>`,
    ctaLabel: "Continue",
    textBody: "Your Star Connect membership is approved.\n{{billingUrl}}",
  },
  {
    key: "news_article",
    name: "News article published",
    description: "Broadcast when a news article is published.",
    category: "news",
    sentFrom: "both",
    variables: [
      NAME,
      { key: "articleTitle", label: "Article title", sample: "Community update" },
      { key: "excerpt", label: "Excerpt", sample: "A short preview of the article…" },
      { key: "articleUrl", label: "Article URL", sample: "https://example.com/news/1" },
    ],
    subject: "New article: {{articleTitle}}",
    preheader: "{{articleTitle}}",
    title: "New community update",
    eyebrow: "News",
    bodyHtml: `<p>A new article has been published on Impact Hub Nairobi.</p>`,
    ctaLabel: "Read article",
    textBody: "New article: {{articleTitle}}\n\n{{excerpt}}\n{{articleUrl}}",
  },
  {
    key: "community_opportunity",
    name: "Community opportunity",
    description: "Broadcast when a community opportunity is published.",
    category: "community",
    sentFrom: "both",
    variables: [
      NAME,
      { key: "opportunityTitle", label: "Opportunity title", sample: "Climate fellowship" },
      { key: "summary", label: "Summary", sample: "Apply by end of month…" },
      { key: "source", label: "Source", sample: "Partner org" },
      { key: "detailUrl", label: "Detail URL", sample: "https://example.com/opportunities/1" },
    ],
    subject: "New opportunity: {{opportunityTitle}}",
    preheader: "{{opportunityTitle}}",
    title: "New community opportunity",
    eyebrow: "Programs",
    bodyHtml: `<p>We've scouted a new opportunity that may be relevant for your impact journey.</p>
<p style="color:#71717A;font-size:13px;">Applications are hosted externally — review details on the platform first.</p>`,
    ctaLabel: "View & apply",
    textBody: "New opportunity: {{opportunityTitle}}\n{{summary}}\n{{detailUrl}}",
  },
  {
    key: "visitor_registered",
    name: "Visitor registered (host)",
    description: "Notifies a host that a visitor was registered.",
    category: "space",
    sentFrom: "both",
    variables: [
      NAME,
      { key: "visitorName", label: "Visitor name", sample: "Sam Visitor" },
      { key: "visitDate", label: "Visit date/time", sample: "14 July 2026, 10:00" },
      { key: "purpose", label: "Purpose", sample: "Meeting" },
    ],
    subject: "Visitor registered — {{visitorName}}",
    preheader: "Visitor registered",
    title: "Visitor registered",
    eyebrow: "Front desk",
    bodyHtml: `<p>A visitor has been registered under your name at Impact Hub Nairobi.</p>`,
    ctaLabel: "View visitors",
    textBody: "Visitor registered: {{visitorName}}\n{{visitDate}}\n{{purpose}}",
  },
  {
    key: "visitor_arrived",
    name: "Visitor arrived (host)",
    description: "Notifies a host when their visitor checks in.",
    category: "space",
    sentFrom: "admin",
    variables: [
      NAME,
      { key: "visitorName", label: "Visitor name", sample: "Sam Visitor" },
      { key: "arrivedAt", label: "Arrival time", sample: "14 July 2026, 10:05" },
    ],
    subject: "Your visitor has arrived — {{visitorName}}",
    preheader: "Visitor arrived",
    title: "Visitor arrived",
    eyebrow: "Front desk",
    bodyHtml: `<p><strong>{{visitorName}}</strong> has checked in at the front desk.</p>`,
    ctaLabel: "Open dashboard",
    textBody: "Your visitor has arrived: {{visitorName}}\n{{arrivedAt}}",
  },
  {
    key: "package_received",
    name: "Package received",
    description: "Notifies a member that a delivery/package arrived.",
    category: "space",
    sentFrom: "admin",
    variables: [
      NAME,
      { key: "courier", label: "Courier", sample: "DHL" },
      { key: "tracking", label: "Tracking / note", sample: "Package at reception" },
      { key: "receivedAt", label: "Received at", sample: "14 July 2026, 2:00 PM" },
    ],
    subject: "Package received for you",
    preheader: "Delivery at reception",
    title: "Package received",
    eyebrow: "Front desk",
    bodyHtml: `<p>A package has arrived for you at Impact Hub Nairobi reception.</p>`,
    ctaLabel: "Open dashboard",
    textBody: "Package received\n{{courier}}\n{{tracking}}\n{{receivedAt}}",
  },
  {
    key: "connection_request",
    name: "Connection request",
    description: "Sent when another member requests to connect.",
    category: "community",
    sentFrom: "member",
    variables: [
      NAME,
      { key: "fromName", label: "Requester name", sample: "Alex Member" },
      { key: "message", label: "Message", sample: "Would love to connect about climate work." },
      { key: "actionUrl", label: "Action URL", sample: "https://example.com/connections" },
    ],
    subject: "{{fromName}} wants to connect on Impact Hub Nairobi",
    preheader: "New connection request",
    title: "New connection request",
    eyebrow: "Community",
    bodyHtml: `<p><strong>{{fromName}}</strong> would like to connect with you.</p>`,
    ctaLabel: "View request",
    textBody: "{{fromName}} wants to connect.\n{{message}}\n{{actionUrl}}",
  },
  {
    key: "member_message",
    name: "Member message",
    description: "Sent when a connected member sends a message.",
    category: "community",
    sentFrom: "member",
    variables: [
      NAME,
      { key: "fromName", label: "Sender name", sample: "Alex Member" },
      { key: "message", label: "Message preview", sample: "Looking forward to meeting…" },
      { key: "actionUrl", label: "Action URL", sample: "https://example.com/messages" },
    ],
    subject: "New message from {{fromName}}",
    preheader: "You have a new message",
    title: "New message",
    eyebrow: "Community",
    bodyHtml: `<p><strong>{{fromName}}</strong> sent you a message on Impact Hub Nairobi.</p>`,
    ctaLabel: "Open conversation",
    textBody: "New message from {{fromName}}\n{{message}}\n{{actionUrl}}",
  },
  {
    key: "invoice_reminder",
    name: "Invoice reminder",
    description: "Reminds a member about an unpaid invoice.",
    category: "billing",
    sentFrom: "member",
    variables: [
      NAME,
      { key: "invoiceLabel", label: "Invoice label", sample: "INV-1042" },
      { key: "amount", label: "Amount", sample: "KES 15,000" },
      { key: "dueDate", label: "Due date", sample: "20 July 2026" },
      { key: "billingUrl", label: "Billing URL", sample: "https://example.com/billing" },
    ],
    subject: "Invoice reminder — {{invoiceLabel}}",
    preheader: "Payment reminder",
    title: "Invoice reminder",
    eyebrow: "Billing",
    bodyHtml: `<p>This is a friendly reminder that you have an outstanding invoice.</p>`,
    ctaLabel: "View billing",
    textBody: "Invoice reminder: {{invoiceLabel}}\n{{amount}}\nDue: {{dueDate}}\n{{billingUrl}}",
  },
  {
    key: "subscription_renewal_reminder",
    name: "Subscription renewal reminder",
    description: "Reminds a member that their membership renews soon.",
    category: "billing",
    sentFrom: "member",
    variables: [
      NAME,
      { key: "planName", label: "Plan name", sample: "Community Member" },
      { key: "renewalDate", label: "Renewal date", sample: "1 August 2026" },
      { key: "billingUrl", label: "Billing URL", sample: "https://example.com/billing" },
    ],
    subject: "Your {{planName}} membership renews soon",
    preheader: "Renewal reminder",
    title: "Membership renewal",
    eyebrow: "Billing",
    bodyHtml: `<p>Your <strong>{{planName}}</strong> membership renews on <strong>{{renewalDate}}</strong>.</p>`,
    ctaLabel: "Manage membership",
    textBody:
      "Your {{planName}} membership renews on {{renewalDate}}.\n{{billingUrl}}",
  },
  {
    key: "admin_invite",
    name: "Admin invite",
    description: "Invite a colleague to the admin dashboard.",
    category: "admin",
    sentFrom: "admin",
    variables: [
      NAME,
      { key: "roleLabel", label: "Role", sample: "Community Manager" },
      { key: "invitedBy", label: "Invited by", sample: "Alex" },
      { key: "inviteUrl", label: "Invite URL", sample: "https://admin.example.com/invite" },
    ],
    subject: "You're invited to Impact Hub Nairobi Admin",
    preheader: "Create your admin password",
    title: "Admin dashboard invite",
    eyebrow: "Admin",
    bodyHtml: `<p>{{invitedBy}} invited you to the <strong>Impact Hub Nairobi Admin Dashboard</strong> as <strong>{{roleLabel}}</strong>.</p>
<p style="color:#71717A;font-size:13px;">This link expires in 7 days. If you were not expecting this invite, you can ignore this email.</p>`,
    ctaLabel: "Create your password",
    textBody:
      "You were invited as {{roleLabel}}.\n\nCreate your password: {{inviteUrl}}\n\nThis link expires in 7 days.",
  },
  {
    key: "notification",
    name: "Generic notification",
    description: "Fallback email for in-app notifications that also send email.",
    category: "community",
    sentFrom: "both",
    variables: [
      NAME,
      { key: "notificationTitle", label: "Title", sample: "Update from Impact Hub" },
      { key: "message", label: "Message", sample: "Something new happened…" },
      { key: "actionUrl", label: "Action URL", sample: "https://example.com/dashboard" },
    ],
    subject: "{{notificationTitle}}",
    preheader: "{{message}}",
    title: "{{notificationTitle}}",
    eyebrow: "Notification",
    bodyHtml: `<p>{{message}}</p>
<p style="color:#71717A;font-size:13px;">You can also find this in your notifications on the community platform.</p>`,
    ctaLabel: "View in platform",
    textBody: "{{notificationTitle}}\n\n{{message}}\n\n{{actionUrl}}",
  },
]

export const EMAIL_TEMPLATE_CATEGORY_LABELS: Record<EmailTemplateCategory, string> = {
  account: "Account",
  bookings: "Bookings",
  events: "Events",
  membership: "Membership",
  space: "Space / front desk",
  news: "News",
  community: "Community",
  billing: "Billing",
  admin: "Admin",
}

export function getEmailTemplateDefinition(key: string): EmailTemplateDefinition | undefined {
  return EMAIL_TEMPLATE_CATALOG.find((t) => t.key === key)
}

export function getSampleVariables(def: EmailTemplateDefinition): Record<string, string> {
  return Object.fromEntries(def.variables.map((v) => [v.key, v.sample]))
}
