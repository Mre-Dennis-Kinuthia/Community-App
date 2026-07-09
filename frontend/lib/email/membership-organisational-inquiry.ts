import { getEmailStaffTo } from "./config"
import { sendEmail, type SendEmailResult } from "./send"
import {
  escapeHtml,
  layoutEmail,
  emailGreeting,
  emailParagraph,
  emailDetailCard,
  emailMutedNote,
  emailHighlightBox,
  EMAIL_BRAND,
} from "./templates"
import { getAppBaseUrl } from "@/lib/app-url"
import {
  ORGANISATIONAL_DISCOVERY_CALL_URL,
  ORGANISATIONAL_PLAN_NAME,
  ORGANISATIONAL_REGISTER_PATH,
  ORGANISATIONAL_RESPONSE_SLA,
} from "@/lib/membership-inquiry"

export type OrganisationalInquiryPayload = {
  fullName: string
  email: string
  phone: string
  location: string
  contactRole: string
  organizationName: string
  organizationType: string
  organizationMandate: string
  geographicScope: string
  focusSectors: string[]
  staffScale: string
  engagementModels: string[]
  audienceReach: string[]
  engagementTimeline: string
  partnershipObjectives: string
  budgetBand?: string
  websiteUrl?: string
  howHeard?: string
  referralName?: string
  message?: string
}

function buildStaffBodyHtml(params: OrganisationalInquiryPayload): string {
  const submitted = new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  }).format(new Date())

  const rows = [
    { label: "Organisation", value: escapeHtml(params.organizationName) },
    { label: "Type", value: escapeHtml(params.organizationType) },
    { label: "Mandate", value: escapeHtml(params.organizationMandate) },
    { label: "Geographic scope", value: escapeHtml(params.geographicScope) },
    { label: "Focus sectors", value: escapeHtml(params.focusSectors.join(" · ")) },
    { label: "Team / programme scale", value: escapeHtml(params.staffScale) },
    { label: "Website", value: escapeHtml(params.websiteUrl?.trim() || "—") },
    { label: "Contact", value: escapeHtml(params.fullName) },
    { label: "Role", value: escapeHtml(params.contactRole) },
    { label: "Email", value: escapeHtml(params.email) },
    { label: "Phone", value: escapeHtml(params.phone) },
    { label: "Location", value: escapeHtml(params.location) },
    {
      label: "Engagement models",
      value: escapeHtml(params.engagementModels.join(" · ")),
    },
    {
      label: "Audiences to reach",
      value: escapeHtml(params.audienceReach.join(" · ")),
    },
    { label: "Timeline", value: escapeHtml(params.engagementTimeline) },
    { label: "Budget band", value: escapeHtml(params.budgetBand?.trim() || "—") },
    { label: "Partnership objectives", value: escapeHtml(params.partnershipObjectives) },
    { label: "How they heard", value: escapeHtml(params.howHeard?.trim() || "—") },
    { label: "Referral", value: escapeHtml(params.referralName?.trim() || "—") },
  ]

  return `
    ${emailParagraph(
      `New <strong>${escapeHtml(ORGANISATIONAL_PLAN_NAME)}</strong> partnership inquiry — please follow up ${escapeHtml(ORGANISATIONAL_RESPONSE_SLA)} to scope engagement and pricing.`
    )}
    ${emailMutedNote(`${escapeHtml(submitted)} (Nairobi)`)}
    ${emailDetailCard(rows, { title: "Partnership inquiry" })}
    ${
      params.message?.trim()
        ? emailHighlightBox(`<strong>Notes</strong><br />${escapeHtml(params.message.trim())}`)
        : ""
    }
    ${emailMutedNote(
      `Partnership call: <a href="${escapeHtml(ORGANISATIONAL_DISCOVERY_CALL_URL)}" style="color:${EMAIL_BRAND.primary};font-weight:600;text-decoration:none;">Book with partnerships team</a>`
    )}
  `
}

export function buildOrganisationalInquiryPlainText(
  params: OrganisationalInquiryPayload
): string {
  return [
    `${ORGANISATIONAL_PLAN_NAME} partnership inquiry`,
    "",
    `${params.organizationName} (${params.organizationType})`,
    params.organizationMandate,
    `Scope: ${params.geographicScope} · Sectors: ${params.focusSectors.join(", ")} · Scale: ${params.staffScale}`,
    params.websiteUrl ? `Website: ${params.websiteUrl}` : "",
    "",
    `Contact: ${params.fullName} · ${params.contactRole}`,
    `${params.email} · ${params.phone} · ${params.location}`,
    "",
    `Engagement: ${params.engagementModels.join(", ")}`,
    `Audiences: ${params.audienceReach.join(", ")}`,
    `Timeline: ${params.engagementTimeline}`,
    params.budgetBand ? `Budget: ${params.budgetBand}` : "",
    `Objectives: ${params.partnershipObjectives}`,
    params.howHeard ? `Heard: ${params.howHeard}` : "",
    params.referralName ? `Referral: ${params.referralName}` : "",
    params.message?.trim() ? `\nNotes: ${params.message.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

export async function sendOrganisationalInquiryStaffEmail(
  params: OrganisationalInquiryPayload
): Promise<SendEmailResult> {
  return sendEmail({
    to: getEmailStaffTo(),
    subject: `[Partnership] ${ORGANISATIONAL_PLAN_NAME} — ${params.organizationName}`,
    html: layoutEmail({
      preheader: `New ${ORGANISATIONAL_PLAN_NAME} partnership inquiry`,
      title: "Partnership inquiry",
      eyebrow: "Organisational membership",
      bodyHtml: buildStaffBodyHtml(params),
    }),
    text: buildOrganisationalInquiryPlainText(params),
    replyTo: params.email,
  })
}

export async function sendOrganisationalInquiryConfirmationEmail(
  params: Pick<OrganisationalInquiryPayload, "fullName" | "email" | "organizationName">
): Promise<SendEmailResult> {
  const firstName = params.fullName.split(/\s+/)[0] || params.fullName
  const appUrl = getAppBaseUrl()
  const registerUrl = `${appUrl}${ORGANISATIONAL_REGISTER_PATH}`

  const bodyHtml = `
    ${emailGreeting(firstName)}
    ${emailParagraph(
      `Thank you for submitting a partnership inquiry for <strong>${escapeHtml(params.organizationName)}</strong>. Our partnerships team will review your institution profile and proposed engagement.`
    )}
    ${emailParagraph(
      `We typically respond ${escapeHtml(ORGANISATIONAL_RESPONSE_SLA)}. Create your platform account with the same email so we can link your inquiry and co-design next steps.`
    )}
    ${emailDetailCard(
      [
        { label: "Response time", value: escapeHtml(ORGANISATIONAL_RESPONSE_SLA) },
        { label: "Next step", value: "Partnership scoping conversation" },
      ],
      { title: "What happens next" }
    )}
    ${emailMutedNote(
      `Optional: <a href="${escapeHtml(ORGANISATIONAL_DISCOVERY_CALL_URL)}" style="color:${EMAIL_BRAND.primary};font-weight:600;text-decoration:none;">Book a partnership call</a>`
    )}
  `

  return sendEmail({
    to: params.email,
    subject: `Partnership inquiry received — ${params.organizationName}`,
    html: layoutEmail({
      preheader: `Partnership inquiry — response ${ORGANISATIONAL_RESPONSE_SLA}`,
      title: "Inquiry received",
      eyebrow: "Organisational membership",
      bodyHtml,
      ctaLabel: "Create platform account",
      ctaUrl: registerUrl,
    }),
    text: [
      `Hi ${firstName},`,
      `We received the partnership inquiry for ${params.organizationName} and will respond ${ORGANISATIONAL_RESPONSE_SLA}.`,
      `Create your account: ${registerUrl}`,
      `Book a call: ${ORGANISATIONAL_DISCOVERY_CALL_URL}`,
    ].join("\n"),
  })
}

export type OrganisationalProfileCompletedPayload = {
  email: string
  name?: string | null
  organization?: string | null
  role?: string | null
  sector?: string | null
  location?: string | null
  goals?: string[]
  bio?: string | null
}

export function buildOrganisationalProfileCompletedPlainText(
  params: OrganisationalProfileCompletedPayload
): string {
  return [
    `${ORGANISATIONAL_PLAN_NAME} — profile completed on platform`,
    "",
    params.name?.trim() ? `Name: ${params.name.trim()}` : "",
    `Email: ${params.email}`,
    params.organization ? `Organisation: ${params.organization}` : "",
    params.role ? `Role: ${params.role}` : "",
    params.sector ? `Sector: ${params.sector}` : "",
    params.location ? `Location: ${params.location}` : "",
    params.goals?.length ? `Goals: ${params.goals.join(", ")}` : "",
    params.bio?.trim() ? `\nBio: ${params.bio.trim()}` : "",
    "",
    "Member finished onboarding — ready for partnership scoping call.",
  ]
    .filter(Boolean)
    .join("\n")
}

export async function sendOrganisationalProfileCompletedStaffEmail(
  params: OrganisationalProfileCompletedPayload
): Promise<SendEmailResult> {
  const memberLabel = params.name?.trim()
    ? `${escapeHtml(params.name.trim())} (${escapeHtml(params.email)})`
    : escapeHtml(params.email)

  const rows = [
    { label: "Member", value: memberLabel },
    { label: "Organisation", value: escapeHtml(params.organization?.trim() || "—") },
    { label: "Role", value: escapeHtml(params.role?.trim() || "—") },
    { label: "Sector", value: escapeHtml(params.sector?.trim() || "—") },
    { label: "Location", value: escapeHtml(params.location?.trim() || "—") },
    {
      label: "Goals",
      value: escapeHtml(params.goals?.length ? params.goals.join(" · ") : "—"),
    },
  ]

  const bodyHtml = `
    ${emailParagraph(
      `An <strong>${escapeHtml(ORGANISATIONAL_PLAN_NAME)}</strong> member completed their platform profile. Review their partnership inquiry and schedule a scoping conversation.`
    )}
    ${emailDetailCard(rows, { title: "Profile summary" })}
    ${
      params.bio?.trim()
        ? emailHighlightBox(`<strong>Bio</strong><br />${escapeHtml(params.bio.trim())}`)
        : ""
    }
  `

  return sendEmail({
    to: getEmailStaffTo(),
    subject: `[Membership] ${ORGANISATIONAL_PLAN_NAME} — profile complete — ${params.email}`,
    html: layoutEmail({
      preheader: "Organisational member finished onboarding",
      title: "Profile completed",
      eyebrow: "Membership",
      bodyHtml,
    }),
    text: buildOrganisationalProfileCompletedPlainText(params),
    replyTo: params.email,
  })
}
