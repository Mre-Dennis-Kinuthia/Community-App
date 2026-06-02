import { sendEmail } from "./send"
import { layoutEmail } from "./templates"
import { escapeHtml } from "./templates"

export async function sendMembershipActivatedEmail(params: {
  to: string
  name?: string | null
  planName: string
  periodEnd: Date
  billingUrl: string
}) {
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : "Hi,"
  const until = params.periodEnd.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const bodyHtml = `
    <p>${greeting}</p>
    <p>Your <strong>${escapeHtml(params.planName)}</strong> membership at Impact Hub Nairobi is now active.</p>
    <p>You have access through <strong>${escapeHtml(until)}</strong>.</p>
    <p>Manage your plan, invoices, and renewal settings anytime from billing.</p>
  `

  return sendEmail({
    to: params.to,
    subject: `Membership active — ${params.planName}`,
    html: layoutEmail({
      preheader: "Your membership is active",
      title: "Welcome aboard",
      bodyHtml,
      ctaLabel: "View billing",
      ctaUrl: params.billingUrl,
    }),
    text: `Your ${params.planName} membership is active until ${until}. Billing: ${params.billingUrl}`,
  })
}
