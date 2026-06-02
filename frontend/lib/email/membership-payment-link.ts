import { sendEmail, type SendEmailResult } from "./send"
import { escapeHtml, layoutEmail } from "./templates"

function getAppBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "http://localhost:3000"
  const withProtocol = url.startsWith("http") ? url : `https://${url}`
  return withProtocol.replace(/\/$/, "")
}

export async function sendMembershipPaymentLinkEmail(params: {
  to: string
  recipientName?: string | null
  planName: string
  amount: number
  currency: string
  interval: string
  payUrl: string
  expiresAt: Date
  adminNote?: string | null
}): Promise<SendEmailResult> {
  const greeting = params.recipientName
    ? `Hi ${escapeHtml(params.recipientName)},`
    : "Hi,"
  const amountLabel = `${params.currency} ${params.amount.toLocaleString()}`
  const intervalLabel = params.interval === "yearly" ? "year" : "month"
  const expires = params.expiresAt.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const noteBlock = params.adminNote?.trim()
    ? `<p><strong>Note from our team:</strong> ${escapeHtml(params.adminNote.trim())}</p>`
    : ""

  const bodyHtml = `
    <p>${greeting}</p>
    <p>You have been invited to complete your <strong>${escapeHtml(params.planName)}</strong> membership at Impact Hub Nairobi.</p>
    <p><strong>Amount:</strong> ${escapeHtml(amountLabel)} per ${escapeHtml(intervalLabel)}</p>
    <p>This secure payment link expires on <strong>${escapeHtml(expires)}</strong>.</p>
    ${noteBlock}
    <p>If you do not yet have a community account, you can create one when you open the link using the same email address.</p>
  `

  return sendEmail({
    to: params.to,
    subject: `Complete your Impact Hub Nairobi membership — ${params.planName}`,
    html: layoutEmail({
      preheader: `Pay ${amountLabel} for ${params.planName}`,
      title: "Membership payment",
      bodyHtml,
      ctaLabel: "Pay membership",
      ctaUrl: params.payUrl,
    }),
    text: `Complete your ${params.planName} membership (${amountLabel}/${intervalLabel}). Pay here: ${params.payUrl}\nExpires: ${expires}`,
  })
}
