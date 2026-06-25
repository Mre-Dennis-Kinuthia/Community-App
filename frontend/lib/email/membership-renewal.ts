import { sendEmail } from "./send"
import {
  layoutEmail,
  escapeHtml,
  emailGreeting,
  emailParagraph,
  emailDetailCard,
  emailMutedNote,
} from "./templates"

export async function sendMembershipRenewalReminderEmail(params: {
  to: string
  name?: string | null
  planName: string
  amount: number
  currency: string
  renewDate: Date
  billingUrl: string
}) {
  const when = params.renewDate.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const amountLabel = `${params.currency} ${params.amount.toLocaleString()}`

  const bodyHtml = `
    ${emailGreeting(params.name)}
    ${emailParagraph(`Your <strong>${escapeHtml(params.planName)}</strong> membership renews on <strong>${escapeHtml(when)}</strong>.`)}
    ${emailDetailCard(
      [
        { label: "Plan", value: escapeHtml(params.planName) },
        { label: "Renews", value: escapeHtml(when) },
        { label: "Expected amount", value: escapeHtml(amountLabel) },
      ],
      { title: "Renewal" }
    )}
    ${emailMutedNote("Update your plan or payment details before the renewal date if needed.")}
  `

  return sendEmail({
    to: params.to,
    subject: `Membership renews on ${when}`,
    html: layoutEmail({
      preheader: `Renewal on ${when}`,
      title: "Renewal reminder",
      eyebrow: "Billing",
      bodyHtml,
      ctaLabel: "Manage billing",
      ctaUrl: params.billingUrl,
    }),
    text: `Your ${params.planName} membership renews ${when} (${amountLabel}). ${params.billingUrl}`,
  })
}
