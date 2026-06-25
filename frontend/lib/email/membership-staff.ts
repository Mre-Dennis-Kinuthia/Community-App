import { sendEmail, type SendEmailResult } from "./send"
import { getEmailStaffTo } from "./config"
import {
  escapeHtml,
  layoutEmail,
  emailParagraph,
  emailDetailCard,
} from "./templates"

function getAdminMembershipUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_ADMIN_APP_URL?.trim() ||
    process.env.ADMIN_APP_URL?.trim() ||
    ""
  if (!base) return ""
  const withProtocol = base.startsWith("http") ? base : `https://${base}`
  return `${withProtocol.replace(/\/$/, "")}/dashboard/membership`
}

export async function sendNewMembershipStaffEmail(params: {
  memberName?: string | null
  memberEmail: string
  planName: string
  amount: number
  currency: string
  method: string
  source: "self_serve" | "payment_link"
  periodEnd: Date
}): Promise<SendEmailResult> {
  const memberLabel = params.memberName
    ? `${escapeHtml(params.memberName)} (${escapeHtml(params.memberEmail)})`
    : escapeHtml(params.memberEmail)
  const amountLabel = `${params.currency} ${params.amount.toLocaleString("en-KE")}`
  const until = params.periodEnd.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const sourceLabel =
    params.source === "payment_link" ? "Payment link" : "Self-serve billing"
  const methodLabel = params.method.replace(/_/g, " ")
  const adminUrl = getAdminMembershipUrl()

  const bodyHtml = `
    ${emailParagraph("A member completed a membership payment.")}
    ${emailDetailCard(
      [
        { label: "Member", value: memberLabel },
        { label: "Plan", value: escapeHtml(params.planName) },
        { label: "Amount", value: escapeHtml(amountLabel) },
        { label: "Method", value: escapeHtml(methodLabel) },
        { label: "Source", value: escapeHtml(sourceLabel) },
        { label: "Active until", value: escapeHtml(until) },
      ],
      { title: "Payment received" }
    )}
  `

  return sendEmail({
    to: getEmailStaffTo(),
    subject: `[Membership] ${params.planName} — ${params.memberEmail}`,
    html: layoutEmail({
      title: "New membership payment",
      eyebrow: "Staff alert",
      bodyHtml,
      ctaLabel: adminUrl ? "Open membership dashboard" : undefined,
      ctaUrl: adminUrl || undefined,
    }),
    text: `New membership: ${params.memberName ?? params.memberEmail}\nPlan: ${params.planName}\n${amountLabel}\n${sourceLabel}\nUntil: ${until}`,
    replyTo: params.memberEmail,
  })
}
