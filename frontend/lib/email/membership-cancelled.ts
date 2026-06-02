import { sendEmail, type SendEmailResult } from "./send"
import { getEmailStaffTo } from "./config"
import { escapeHtml, layoutEmail } from "./templates"
import { getAppBaseUrl } from "@/lib/membership-billing"

function getAdminMembershipUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_ADMIN_APP_URL?.trim() ||
    process.env.ADMIN_APP_URL?.trim() ||
    ""
  if (!base) return ""
  const withProtocol = base.startsWith("http") ? base : `https://${base}`
  return `${withProtocol.replace(/\/$/, "")}/dashboard/membership`
}

export async function sendMembershipCancelledMemberEmail(params: {
  to: string
  name?: string | null
  planName: string
  immediate: boolean
  accessUntil?: Date
}): Promise<SendEmailResult> {
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi,"
  const billingUrl = `${getAppBaseUrl()}/billing`
  const bodyHtml = params.immediate
    ? `
    <p>${greeting}</p>
    <p>Your <strong>${escapeHtml(params.planName)}</strong> membership has been cancelled and is no longer active.</p>
    <p>You can subscribe again anytime from your billing page if you would like to rejoin.</p>
  `
    : `
    <p>${greeting}</p>
    <p>We received your request to cancel <strong>${escapeHtml(params.planName)}</strong> at the end of the current billing period.</p>
    <p>Your membership stays active until <strong>${escapeHtml(
      params.accessUntil!.toLocaleDateString("en-KE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    )}</strong>, and will not renew after that.</p>
  `

  return sendEmail({
    to: params.to,
    subject: params.immediate
      ? `Membership cancelled — ${params.planName}`
      : `Membership will not renew — ${params.planName}`,
    html: layoutEmail({
      title: params.immediate ? "Membership cancelled" : "Cancellation scheduled",
      bodyHtml,
      ctaLabel: "View billing",
      ctaUrl: billingUrl,
    }),
    text: params.immediate
      ? `Your ${params.planName} membership was cancelled. Billing: ${billingUrl}`
      : `Your ${params.planName} membership ends ${params.accessUntil?.toISOString().slice(0, 10)}.`,
  })
}

export async function sendMembershipCancelledStaffEmail(params: {
  memberName?: string | null
  memberEmail: string
  planName: string
  immediate: boolean
  accessUntil?: Date
}): Promise<SendEmailResult> {
  const memberLabel = params.memberName
    ? `${escapeHtml(params.memberName)} (${escapeHtml(params.memberEmail)})`
    : escapeHtml(params.memberEmail)
  const when = params.immediate
    ? "Cancelled immediately"
    : `Scheduled — access until ${params.accessUntil!.toLocaleDateString("en-KE", { dateStyle: "long" })}`
  const adminUrl = getAdminMembershipUrl()
  const adminCta = adminUrl
    ? `<p><a href="${escapeHtml(adminUrl)}">Open membership dashboard</a></p>`
    : ""

  const bodyHtml = `
    <p>A member updated their membership subscription.</p>
    <p><strong>Member:</strong> ${memberLabel}<br />
    <strong>Plan:</strong> ${escapeHtml(params.planName)}<br />
    <strong>Change:</strong> ${escapeHtml(when)}</p>
    ${adminCta}
  `

  return sendEmail({
    to: getEmailStaffTo(),
    subject: `[Membership] Cancellation — ${params.memberEmail}`,
    html: layoutEmail({ title: "Membership cancellation", bodyHtml }),
    text: `Membership cancellation: ${params.memberName ?? params.memberEmail}\n${params.planName}\n${when}`,
    replyTo: params.memberEmail,
  })
}
