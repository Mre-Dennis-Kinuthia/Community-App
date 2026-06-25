import { sendEmail } from "./send"
import {
  layoutEmail,
  escapeHtml,
  emailGreeting,
  emailParagraph,
  emailDetailCard,
  emailMutedNote,
} from "./templates"

export async function sendMembershipActivatedEmail(params: {
  to: string
  name?: string | null
  planName: string
  periodEnd: Date
  billingUrl: string
}) {
  const until = params.periodEnd.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const bodyHtml = `
    ${emailGreeting(params.name)}
    ${emailParagraph(`Your <strong>${escapeHtml(params.planName)}</strong> membership at Impact Hub Nairobi is now active.`)}
    ${emailDetailCard(
      [
        { label: "Plan", value: escapeHtml(params.planName) },
        { label: "Active until", value: escapeHtml(until) },
      ],
      { title: "Membership" }
    )}
    ${emailMutedNote("Manage your plan, invoices, and renewal settings anytime from billing.")}
  `

  return sendEmail({
    to: params.to,
    subject: `Membership active — ${params.planName}`,
    html: layoutEmail({
      preheader: "Your membership is active",
      title: "Welcome aboard",
      eyebrow: "Membership",
      bodyHtml,
      ctaLabel: "View billing",
      ctaUrl: params.billingUrl,
    }),
    text: `Your ${params.planName} membership is active until ${until}. Billing: ${params.billingUrl}`,
  })
}
