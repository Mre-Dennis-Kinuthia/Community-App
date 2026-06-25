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
} from "./templates"
import {
  STAR_CONNECT_DISCOVERY_CALL_URL,
  STAR_CONNECT_PLAN_NAME,
  STAR_CONNECT_PRICE_LABEL,
  STAR_CONNECT_RESPONSE_SLA,
} from "@/lib/membership-inquiry"

export type StarConnectInquiryPayload = {
  fullName: string
  email: string
  phone: string
  location: string
  linkedinUrl?: string
  websiteUrl?: string
  organization: string
  ventureDescription: string
  role: string
  sector: string
  ventureStage: string
  primaryNeeds: string[]
  workspaceNeed: string
  targetStart: string
  supportNeeded: string
  howHeard?: string
  referralName?: string
  message?: string
}

function buildStaffBodyHtml(params: StarConnectInquiryPayload): string {
  const submitted = new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  }).format(new Date())

  const rows = [
    { label: "Applicant", value: escapeHtml(params.fullName) },
    { label: "Email", value: escapeHtml(params.email) },
    { label: "Phone", value: escapeHtml(params.phone) },
    { label: "Location", value: escapeHtml(params.location) },
    { label: "LinkedIn", value: escapeHtml(params.linkedinUrl?.trim() || "—") },
    { label: "Website", value: escapeHtml(params.websiteUrl?.trim() || "—") },
    { label: "Organization", value: escapeHtml(params.organization) },
    { label: "Venture", value: escapeHtml(params.ventureDescription) },
    { label: "Role", value: escapeHtml(params.role) },
    { label: "Sector", value: escapeHtml(params.sector) },
    { label: "Stage", value: escapeHtml(params.ventureStage) },
    { label: "Looking for", value: escapeHtml(params.primaryNeeds.join(" · ")) },
    { label: "Workspace", value: escapeHtml(params.workspaceNeed) },
    { label: "Start timing", value: escapeHtml(params.targetStart) },
    { label: "Support needed", value: escapeHtml(params.supportNeeded) },
    { label: "How they heard", value: escapeHtml(params.howHeard?.trim() || "—") },
    { label: "Referral", value: escapeHtml(params.referralName?.trim() || "—") },
  ]

  return `
    ${emailParagraph(
      `New <strong>${escapeHtml(STAR_CONNECT_PLAN_NAME)}</strong> membership request — please follow up ${escapeHtml(STAR_CONNECT_RESPONSE_SLA)}.`
    )}
    ${emailMutedNote(`${escapeHtml(submitted)} (Nairobi) · ${escapeHtml(STAR_CONNECT_PRICE_LABEL)}`)}
    ${emailDetailCard(rows, { title: "Application details" })}
    ${
      params.message?.trim()
        ? emailHighlightBox(`<strong>Notes</strong><br />${escapeHtml(params.message.trim())}`)
        : ""
    }
    ${emailMutedNote(
      `Encourage applicant to book a discovery call: <a href="${escapeHtml(STAR_CONNECT_DISCOVERY_CALL_URL)}" style="color:#A6192E;font-weight:600;text-decoration:none;">Community Office Hours</a>`
    )}
  `
}

/** Plain-text summary for support tickets and staff email fallback */
export function buildStarConnectInquiryPlainText(params: StarConnectInquiryPayload): string {
  return [
    `${STAR_CONNECT_PLAN_NAME} membership request`,
    "",
    `${params.fullName} · ${params.email} · ${params.phone}`,
    `Location: ${params.location}`,
    params.linkedinUrl ? `LinkedIn: ${params.linkedinUrl}` : "",
    params.websiteUrl ? `Website: ${params.websiteUrl}` : "",
    "",
    `${params.organization}`,
    params.ventureDescription,
    `${params.role} · ${params.sector} · ${params.ventureStage}`,
    "",
    `Needs: ${params.primaryNeeds.join(", ")}`,
    `Workspace: ${params.workspaceNeed} · Start: ${params.targetStart}`,
    `Support: ${params.supportNeeded}`,
    params.howHeard ? `Heard: ${params.howHeard}` : "",
    params.message?.trim() ? `\nNotes: ${params.message.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n")
}

export async function sendStarConnectInquiryStaffEmail(
  params: StarConnectInquiryPayload
): Promise<SendEmailResult> {
  return sendEmail({
    to: getEmailStaffTo(),
    subject: `[Membership] ${STAR_CONNECT_PLAN_NAME} — ${params.organization}`,
    html: layoutEmail({
      preheader: `New ${STAR_CONNECT_PLAN_NAME} request`,
      title: "Membership request — Star Connect",
      eyebrow: "Membership",
      bodyHtml: buildStaffBodyHtml(params),
    }),
    text: buildStarConnectInquiryPlainText(params),
    replyTo: params.email,
  })
}

export async function sendStarConnectInquiryConfirmationEmail(
  params: Pick<StarConnectInquiryPayload, "fullName" | "email">
): Promise<SendEmailResult> {
  const firstName = params.fullName.split(/\s+/)[0] || params.fullName

  const bodyHtml = `
    ${emailGreeting(firstName)}
    ${emailParagraph(
      `Thanks for applying for <strong>${escapeHtml(STAR_CONNECT_PLAN_NAME)}</strong> (${escapeHtml(STAR_CONNECT_PRICE_LABEL)}).`
    )}
    ${emailParagraph(
      `We are reviewing your request and will reply <strong>${escapeHtml(STAR_CONNECT_RESPONSE_SLA)}</strong> on business days.`
    )}
    ${emailDetailCard(
      [{ label: "Next step", value: "Book a short discovery call" }],
      { title: "What happens next" }
    )}
    ${emailMutedNote("This helps us prepare and confirm next steps.")}
  `

  return sendEmail({
    to: params.email,
    subject: `We received your ${STAR_CONNECT_PLAN_NAME} request`,
    html: layoutEmail({
      preheader: `Response ${STAR_CONNECT_RESPONSE_SLA}`,
      title: "Request received",
      eyebrow: "Membership",
      bodyHtml,
      ctaLabel: "Book discovery call",
      ctaUrl: STAR_CONNECT_DISCOVERY_CALL_URL,
    }),
    text: [
      `Hi ${firstName},`,
      `We received your ${STAR_CONNECT_PLAN_NAME} application and will respond ${STAR_CONNECT_RESPONSE_SLA}.`,
      `Book a call: ${STAR_CONNECT_DISCOVERY_CALL_URL}`,
    ].join("\n"),
  })
}
