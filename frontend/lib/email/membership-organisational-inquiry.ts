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
  organizationName: string
  organizationType: string
  organizationDescription: string
  role: string
  sector: string
  teamSize: string
  partnershipInterests: string[]
  targetStart: string
  partnershipGoals: string
  linkedinUrl?: string
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
    { label: "Contact", value: escapeHtml(params.fullName) },
    { label: "Email", value: escapeHtml(params.email) },
    { label: "Phone", value: escapeHtml(params.phone) },
    { label: "Location", value: escapeHtml(params.location) },
    { label: "Organisation", value: escapeHtml(params.organizationName) },
    { label: "Type", value: escapeHtml(params.organizationType) },
    { label: "About", value: escapeHtml(params.organizationDescription) },
    { label: "Role", value: escapeHtml(params.role) },
    { label: "Sector", value: escapeHtml(params.sector) },
    { label: "Team size", value: escapeHtml(params.teamSize) },
    {
      label: "Partnership interests",
      value: escapeHtml(params.partnershipInterests.join(" · ")),
    },
    { label: "Start timing", value: escapeHtml(params.targetStart) },
    { label: "Partnership goals", value: escapeHtml(params.partnershipGoals) },
    { label: "LinkedIn", value: escapeHtml(params.linkedinUrl?.trim() || "—") },
    { label: "Website", value: escapeHtml(params.websiteUrl?.trim() || "—") },
    { label: "How they heard", value: escapeHtml(params.howHeard?.trim() || "—") },
    { label: "Referral", value: escapeHtml(params.referralName?.trim() || "—") },
  ]

  return `
    ${emailParagraph(
      `New <strong>${escapeHtml(ORGANISATIONAL_PLAN_NAME)}</strong> partnership inquiry — please follow up ${escapeHtml(ORGANISATIONAL_RESPONSE_SLA)} to scope engagement and pricing.`
    )}
    ${emailMutedNote(`${escapeHtml(submitted)} (Nairobi)`)}
    ${emailDetailCard(rows, { title: "Partnership application" })}
    ${
      params.message?.trim()
        ? emailHighlightBox(`<strong>Notes</strong><br />${escapeHtml(params.message.trim())}`)
        : ""
    }
    ${emailMutedNote(
      `Discovery call: <a href="${escapeHtml(ORGANISATIONAL_DISCOVERY_CALL_URL)}" style="color:${EMAIL_BRAND.primary};font-weight:600;text-decoration:none;">Community Office Hours</a>`
    )}
  `
}

export function buildOrganisationalInquiryPlainText(
  params: OrganisationalInquiryPayload
): string {
  return [
    `${ORGANISATIONAL_PLAN_NAME} partnership inquiry`,
    "",
    `${params.fullName} · ${params.email} · ${params.phone}`,
    `Location: ${params.location}`,
    params.linkedinUrl ? `LinkedIn: ${params.linkedinUrl}` : "",
    params.websiteUrl ? `Website: ${params.websiteUrl}` : "",
    "",
    `${params.organizationName} (${params.organizationType})`,
    params.organizationDescription,
    `${params.role} · ${params.sector} · Team: ${params.teamSize}`,
    "",
    `Interests: ${params.partnershipInterests.join(", ")}`,
    `Start: ${params.targetStart}`,
    `Goals: ${params.partnershipGoals}`,
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
    subject: `[Membership] ${ORGANISATIONAL_PLAN_NAME} — ${params.organizationName}`,
    html: layoutEmail({
      preheader: `New ${ORGANISATIONAL_PLAN_NAME} partnership inquiry`,
      title: "Partnership inquiry",
      eyebrow: "Membership",
      bodyHtml: buildStaffBodyHtml(params),
    }),
    text: buildOrganisationalInquiryPlainText(params),
    replyTo: params.email,
  })
}

export async function sendOrganisationalInquiryConfirmationEmail(
  params: Pick<OrganisationalInquiryPayload, "fullName" | "email">
): Promise<SendEmailResult> {
  const firstName = params.fullName.split(/\s+/)[0] || params.fullName
  const appUrl = getAppBaseUrl()
  const registerUrl = `${appUrl}${ORGANISATIONAL_REGISTER_PATH}`

  const bodyHtml = `
    ${emailGreeting(firstName)}
    ${emailParagraph(
      `Thanks for applying for <strong>${escapeHtml(ORGANISATIONAL_PLAN_NAME)}</strong> membership at <strong>Impact Hub Nairobi</strong>. Our partnerships team reviews every inquiry personally.`
    )}
    ${emailParagraph(
      `Create your platform account with the same email so we can link your partnership profile and follow up ${escapeHtml(ORGANISATIONAL_RESPONSE_SLA)}.`
    )}
    ${emailDetailCard(
      [
        { label: "Response time", value: escapeHtml(ORGANISATIONAL_RESPONSE_SLA) },
        { label: "Next step", value: "Create your platform account" },
      ],
      { title: "What happens next" }
    )}
    ${emailMutedNote(
      `Optional call: <a href="${escapeHtml(ORGANISATIONAL_DISCOVERY_CALL_URL)}" style="color:${EMAIL_BRAND.primary};font-weight:600;text-decoration:none;">Community Office Hours</a>`
    )}
  `

  return sendEmail({
    to: params.email,
    subject: `We received your ${ORGANISATIONAL_PLAN_NAME} partnership inquiry`,
    html: layoutEmail({
      preheader: `Partnership inquiry received — response ${ORGANISATIONAL_RESPONSE_SLA}`,
      title: "Application received",
      eyebrow: "Become a member",
      bodyHtml,
      ctaLabel: "Create your account",
      ctaUrl: registerUrl,
    }),
    text: [
      `Hi ${firstName},`,
      `We received your ${ORGANISATIONAL_PLAN_NAME} partnership inquiry and will respond ${ORGANISATIONAL_RESPONSE_SLA}.`,
      `Create your account: ${registerUrl}`,
      `Optional call: ${ORGANISATIONAL_DISCOVERY_CALL_URL}`,
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
      `An <strong>${escapeHtml(ORGANISATIONAL_PLAN_NAME)}</strong> member completed their platform profile. Review their application ticket and schedule a scoping conversation.`
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
