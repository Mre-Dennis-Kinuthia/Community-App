import { getEmailStaffTo } from "./config"
import { sendEmail, type SendEmailResult } from "./send"
import { escapeHtml, layoutEmail } from "./templates"
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

function detailRow(label: string, value: string): string {
  if (!value.trim()) return ""
  return `<tr>
    <td style="padding:8px 12px 8px 0;vertical-align:top;font-size:13px;color:#71717a;width:150px;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;font-size:14px;color:#18181b;line-height:1.5;">${escapeHtml(value)}</td>
  </tr>`
}

function buildStaffBodyHtml(params: StarConnectInquiryPayload): string {
  const submitted = new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  }).format(new Date())

  const rows = [
    detailRow("Applicant", params.fullName),
    detailRow("Email", params.email),
    detailRow("Phone", params.phone),
    detailRow("Location", params.location),
    detailRow("LinkedIn", params.linkedinUrl ?? "—"),
    detailRow("Website", params.websiteUrl ?? "—"),
    detailRow("Organization", params.organization),
    detailRow("About the venture", params.ventureDescription),
    detailRow("Role", params.role),
    detailRow("Sector", params.sector),
    detailRow("Stage", params.ventureStage),
    detailRow("Looking for", params.primaryNeeds.join(" · ")),
    detailRow("Workspace", params.workspaceNeed),
    detailRow("Start timing", params.targetStart),
    detailRow("Support needed", params.supportNeeded),
    detailRow("How they heard", params.howHeard ?? "—"),
    detailRow("Referral", params.referralName ?? "—"),
  ].join("")

  const notes = params.message?.trim()
    ? `<p style="margin:16px 0 8px;font-size:13px;font-weight:600;color:#3f3f46;">Notes</p>
       <p style="margin:0;font-size:14px;line-height:1.6;">${escapeHtml(params.message.trim())}</p>`
    : ""

  return `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
      New <strong>${escapeHtml(STAR_CONNECT_PLAN_NAME)}</strong> membership request — please follow up ${escapeHtml(STAR_CONNECT_RESPONSE_SLA)}.
    </p>
    <p style="margin:0 0 16px;font-size:13px;color:#71717a;">${escapeHtml(submitted)} (Nairobi) · ${escapeHtml(STAR_CONNECT_PRICE_LABEL)}</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e4e4e7;border-radius:6px;background:#fafafa;">
      <tbody>${rows}</tbody>
    </table>
    ${notes}
    <p style="margin:16px 0 0;font-size:13px;color:#3f3f46;">
      Encourage applicant to book a discovery call:
      <a href="${escapeHtml(STAR_CONNECT_DISCOVERY_CALL_URL)}">Community Office Hours</a>
      · Reply-To: applicant email above
    </p>
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
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Thanks for applying for <strong>${escapeHtml(STAR_CONNECT_PLAN_NAME)}</strong> (${escapeHtml(STAR_CONNECT_PRICE_LABEL)}).</p>
    <p>We are reviewing your request and will reply <strong>${escapeHtml(STAR_CONNECT_RESPONSE_SLA)}</strong> on business days.</p>
    <p>Please book a short <strong>discovery call</strong> so we can prepare and confirm next steps:</p>
    <p style="margin:8px 0 0;font-size:14px;"><a href="${escapeHtml(STAR_CONNECT_DISCOVERY_CALL_URL)}">${escapeHtml(STAR_CONNECT_DISCOVERY_CALL_URL)}</a></p>
  `

  return sendEmail({
    to: params.email,
    subject: `We received your ${STAR_CONNECT_PLAN_NAME} request`,
    html: layoutEmail({
      preheader: `Response ${STAR_CONNECT_RESPONSE_SLA}`,
      title: "Request received",
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
