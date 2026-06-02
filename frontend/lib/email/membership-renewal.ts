import { sendEmail } from "./send"
import { layoutEmail } from "./templates"
import { escapeHtml } from "./templates"

export async function sendMembershipRenewalReminderEmail(params: {
  to: string
  name?: string | null
  planName: string
  amount: number
  currency: string
  renewDate: Date
  billingUrl: string
}) {
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi,"
  const when = params.renewDate.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const amountLabel = `${params.currency} ${params.amount.toLocaleString()}`

  const bodyHtml = `
    <p>${greeting}</p>
    <p>Your <strong>${escapeHtml(params.planName)}</strong> membership renews on <strong>${escapeHtml(when)}</strong>.</p>
    <p>Expected amount: ${escapeHtml(amountLabel)}.</p>
    <p>Update your plan or payment details before the renewal date if needed.</p>
  `

  return sendEmail({
    to: params.to,
    subject: `Membership renews on ${when}`,
    html: layoutEmail({
      preheader: `Renewal on ${when}`,
      title: "Renewal reminder",
      bodyHtml,
      ctaLabel: "Manage billing",
      ctaUrl: params.billingUrl,
    }),
    text: `Your ${params.planName} membership renews ${when} (${amountLabel}). ${params.billingUrl}`,
  })
}
