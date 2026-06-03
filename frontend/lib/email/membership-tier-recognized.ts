import { sendEmail, type SendEmailResult } from "./send"
import { escapeHtml, layoutEmail } from "./templates"
import { getAppBaseUrl } from "@/lib/app-url"
import {
  getMembershipTierLabel,
  MEMBERSHIP_TIERS,
  type MembershipTier,
  formatAllowanceHours,
  MEETING_ROOM_ALLOWANCE_MINUTES,
} from "@/lib/membership-tier"
import { ORGANISATIONAL_DISCOVERY_CALL_URL } from "@/lib/membership-inquiry"
import { STAR_CONNECT_DISCOVERY_CALL_URL } from "@/lib/membership-inquiry"

function tierBenefitsHtml(tier: MembershipTier): string {
  if (tier === MEMBERSHIP_TIERS.STAR_CONNECT) {
    const hrs = formatAllowanceHours(MEETING_ROOM_ALLOWANCE_MINUTES.star_connect)
    return `
      <ul style="margin:12px 0;padding-left:20px;font-size:14px;line-height:1.6;">
        <li>Workspace access is included — hot desk booking is not required.</li>
        <li>${escapeHtml(hrs)} of meeting room time included each month at no extra charge.</li>
      </ul>
    `
  }
  if (tier === MEMBERSHIP_TIERS.ORGANISATIONAL) {
    const hrs = formatAllowanceHours(MEETING_ROOM_ALLOWANCE_MINUTES.organisational)
    return `
      <ul style="margin:12px 0;padding-left:20px;font-size:14px;line-height:1.6;">
        <li>Partnership workspace access — hot desk booking is not required.</li>
        <li>${escapeHtml(hrs)} of meeting room time included each month at no extra charge.</li>
      </ul>
    `
  }
  return ""
}

export async function sendMembershipTierRecognizedEmail(params: {
  to: string
  name?: string | null
  tier: MembershipTier
}): Promise<SendEmailResult> {
  const label = getMembershipTierLabel(params.tier) ?? "Member"
  const firstName = params.name?.trim().split(/\s+/)[0]
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,"
  const appUrl = getAppBaseUrl()

  const bodyHtml = `
    <p>${greeting}</p>
    <p>Your Impact Hub Nairobi account is now linked to <strong>${escapeHtml(label)}</strong>.</p>
    ${tierBenefitsHtml(params.tier)}
    <p>Complete your profile and book meeting rooms from your dashboard when you need them.</p>
    ${
      params.tier === MEMBERSHIP_TIERS.STAR_CONNECT
        ? `<p style="margin:12px 0 0;font-size:14px;">Optional: <a href="${escapeHtml(STAR_CONNECT_DISCOVERY_CALL_URL)}">book a discovery call</a> with our team.</p>`
        : params.tier === MEMBERSHIP_TIERS.ORGANISATIONAL
          ? `<p style="margin:12px 0 0;font-size:14px;">Optional: <a href="${escapeHtml(ORGANISATIONAL_DISCOVERY_CALL_URL)}">book a partnership call</a>.</p>`
          : ""
    }
  `

  const ctaLabel =
    params.tier === MEMBERSHIP_TIERS.COMMUNITY
      ? "Go to dashboard"
      : "Book a meeting room"

  const ctaUrl =
    params.tier === MEMBERSHIP_TIERS.STAR_CONNECT
      ? STAR_CONNECT_DISCOVERY_CALL_URL
      : params.tier === MEMBERSHIP_TIERS.ORGANISATIONAL
        ? ORGANISATIONAL_DISCOVERY_CALL_URL
        : params.tier === MEMBERSHIP_TIERS.COMMUNITY
          ? `${appUrl}/dashboard`
          : `${appUrl}/booking`

  const ctaLabelFinal =
    params.tier === MEMBERSHIP_TIERS.STAR_CONNECT ||
    params.tier === MEMBERSHIP_TIERS.ORGANISATIONAL
      ? "Book a call (optional)"
      : ctaLabel

  return sendEmail({
    to: params.to,
    subject: `You're a ${label}`,
    html: layoutEmail({
      preheader: label,
      title: label,
      bodyHtml,
      ctaLabel: ctaLabelFinal,
      ctaUrl,
    }),
    text: [
      firstName ? `Hi ${firstName},` : "Hi,",
      `Your account is linked to ${label}.`,
      `${appUrl}/booking`,
      params.tier === MEMBERSHIP_TIERS.STAR_CONNECT
        ? `Discovery call: ${STAR_CONNECT_DISCOVERY_CALL_URL}`
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
  })
}
