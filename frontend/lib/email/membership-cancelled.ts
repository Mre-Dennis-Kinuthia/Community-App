import { sendEmail, type SendEmailResult } from "./send"
import { getEmailStaffTo } from "./config"
import {
  escapeHtml,
  layoutEmail,
  emailGreeting,
  emailParagraph,
  emailDetailCard,
  emailMutedNote,
} from "./templates"
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
  const billingUrl = `${getAppBaseUrl()}/billing`
  const accessUntilLabel = params.accessUntil
    ? params.accessUntil.toLocaleDateString("en-KE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : ""

  const bodyHtml = params.immediate
    ? `
    ${emailGreeting(params.name)}
    ${emailParagraph(`Your <strong>${escapeHtml(params.planName)}</strong> membership has been cancelled and is no longer active.`)}
    ${emailMutedNote("You can subscribe again anytime from your billing page if you would like to rejoin.")}
  `
    : `
    ${emailGreeting(params.name)}
    ${emailParagraph(
      `We received your request to cancel <strong>${escapeHtml(params.planName)}</strong> at the end of the current billing period.`
    )}
    ${emailDetailCard(
      [{ label: "Access until", value: escapeHtml(accessUntilLabel) }],
      { title: "Cancellation scheduled" }
    )}
    ${emailMutedNote("Your membership will not renew after that date.")}
  `

  return sendEmail({
    to: params.to,
    subject: params.immediate
      ? `Membership cancelled — ${params.planName}`
      : `Membership will not renew — ${params.planName}`,
    html: layoutEmail({
      title: params.immediate ? "Membership cancelled" : "Cancellation scheduled",
      eyebrow: "Membership",
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

  const bodyHtml = `
    ${emailParagraph("A member updated their membership subscription.")}
    ${emailDetailCard(
      [
        { label: "Member", value: memberLabel },
        { label: "Plan", value: escapeHtml(params.planName) },
        { label: "Change", value: escapeHtml(when) },
      ],
      { title: "Cancellation" }
    )}
  `

  return sendEmail({
    to: getEmailStaffTo(),
    subject: `[Membership] Cancellation — ${params.memberEmail}`,
    html: layoutEmail({
      title: "Membership cancellation",
      eyebrow: "Staff alert",
      bodyHtml,
      ctaLabel: adminUrl ? "Open membership dashboard" : undefined,
      ctaUrl: adminUrl || undefined,
    }),
    text: `Membership cancellation: ${params.memberName ?? params.memberEmail}\n${params.planName}\n${when}`,
    replyTo: params.memberEmail,
  })
}
