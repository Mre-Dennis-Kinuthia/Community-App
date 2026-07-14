import { sendEmail, type SendEmailResult } from "./send"
import {
  escapeHtml,
  layoutEmail,
  emailGreeting,
  emailParagraph,
  emailDetailCard,
  emailHighlightBox,
  emailMutedNote,
} from "./templates"
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
    return emailHighlightBox(`
      <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.6;">
        <li>Workspace access is included — hot desk booking is not required.</li>
        <li>${escapeHtml(hrs)} of meeting room time included each month at no extra charge.</li>
      </ul>
    `)
  }
  if (tier === MEMBERSHIP_TIERS.ORGANISATIONAL) {
    const hrs = formatAllowanceHours(MEETING_ROOM_ALLOWANCE_MINUTES.organisational)
    return emailHighlightBox(`
      <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.6;">
        <li>Partnership workspace access — hot desk booking is not required.</li>
        <li>${escapeHtml(hrs)} of meeting room time included each month at no extra charge.</li>
      </ul>
    `)
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
  const appUrl = getAppBaseUrl()

  const bodyHtml = `
    ${emailGreeting(firstName)}
    ${emailParagraph(`Your Impact Hub Nairobi account is now linked to <strong>${escapeHtml(label)}</strong>.`)}
    ${tierBenefitsHtml(params.tier)}
    ${emailDetailCard(
      [{ label: "Membership", value: escapeHtml(label) }],
      { title: "Your tier" }
    )}
    ${emailParagraph("Complete your profile and book meeting rooms from your dashboard when you need them.")}
    ${
      params.tier === MEMBERSHIP_TIERS.STAR_CONNECT
        ? emailMutedNote(
            `Optional: <a href="${escapeHtml(STAR_CONNECT_DISCOVERY_CALL_URL)}" style="color:#822929;font-weight:600;text-decoration:none;">book a discovery call</a> with our team.`
          )
        : params.tier === MEMBERSHIP_TIERS.ORGANISATIONAL
          ? emailMutedNote(
              `Optional: <a href="${escapeHtml(ORGANISATIONAL_DISCOVERY_CALL_URL)}" style="color:#822929;font-weight:600;text-decoration:none;">book a partnership call</a>.`
            )
          : ""
    }
  `

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
      : params.tier === MEMBERSHIP_TIERS.COMMUNITY
        ? "Go to dashboard"
        : "Book a meeting room"

  return sendEmail({
    to: params.to,
    subject: `You're a ${label}`,
    html: layoutEmail({
      preheader: label,
      title: label,
      eyebrow: "Membership",
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
    emailCategory: "membership",
  })
}
