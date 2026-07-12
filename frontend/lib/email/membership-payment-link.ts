import type { SendEmailResult } from "./send"
import {
  escapeHtml,
  emailDetailCard,
  emailHighlightBox,
} from "./templates"
import {
  sendFromTemplate,
  type SendFromTemplateResult,
} from "./resolve-template"

function asSendResult(result: SendFromTemplateResult): SendEmailResult {
  if ("skipped" in result && result.skipped) {
    return { ok: true, id: `skipped:${result.reason}` }
  }
  return result
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
  const amountLabel = `${params.currency} ${params.amount.toLocaleString()}`
  const intervalLabel = params.interval === "yearly" ? "year" : "month"
  const expires = params.expiresAt.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const adminNoteHtml = params.adminNote?.trim()
    ? emailHighlightBox(
        `<strong>Note from our team</strong><br />${escapeHtml(params.adminNote.trim())}`
      )
    : ""

  return asSendResult(
    await sendFromTemplate({
      key: "membership_payment_link",
      to: params.to,
      name: params.recipientName,
      vars: {
        planName: params.planName,
        amountLabel,
        intervalLabel,
        expires,
        payUrl: params.payUrl,
        adminNoteHtml,
      },
      detailsHtml: emailDetailCard(
        [
          { label: "Plan", value: escapeHtml(params.planName) },
          {
            label: "Amount",
            value: `${escapeHtml(amountLabel)} per ${escapeHtml(intervalLabel)}`,
          },
          { label: "Expires", value: escapeHtml(expires) },
        ],
        { title: "Payment details" }
      ),
      ctaUrl: params.payUrl,
    })
  )
}
