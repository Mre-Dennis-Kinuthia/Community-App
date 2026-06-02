import { sendEmail, type SendEmailResult } from "./send"
import { getEmailStaffTo } from "./config"
import { escapeHtml, layoutEmail } from "./templates"

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
  const adminCta = adminUrl
    ? `<p><a href="${escapeHtml(adminUrl)}">Open membership dashboard</a></p>`
    : ""

  const bodyHtml = `
    <p>A member completed a membership payment.</p>
    <p><strong>Member:</strong> ${memberLabel}<br />
    <strong>Plan:</strong> ${escapeHtml(params.planName)}<br />
    <strong>Amount:</strong> ${escapeHtml(amountLabel)}<br />
    <strong>Method:</strong> ${escapeHtml(methodLabel)}<br />
    <strong>Source:</strong> ${escapeHtml(sourceLabel)}<br />
    <strong>Active until:</strong> ${escapeHtml(until)}</p>
    ${adminCta}
  `

  return sendEmail({
    to: getEmailStaffTo(),
    subject: `[Membership] ${params.planName} — ${params.memberEmail}`,
    html: layoutEmail({
      title: "New membership payment",
      bodyHtml,
    }),
    text: `New membership: ${params.memberName ?? params.memberEmail}\nPlan: ${params.planName}\n${amountLabel}\n${sourceLabel}\nUntil: ${until}`,
    replyTo: params.memberEmail,
  })
}
