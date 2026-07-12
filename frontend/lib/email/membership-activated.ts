import {
  escapeHtml,
  emailDetailCard,
} from "./templates"
import {
  sendFromTemplate,
  type SendFromTemplateResult,
} from "./resolve-template"
import type { SendEmailResult } from "./send"

function asSendResult(result: SendFromTemplateResult): SendEmailResult {
  if ("skipped" in result && result.skipped) {
    return { ok: true, id: `skipped:${result.reason}` }
  }
  return result
}

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

  return asSendResult(
    await sendFromTemplate({
      key: "membership_activated",
      to: params.to,
      name: params.name,
      vars: {
        planName: params.planName,
        periodEnd: until,
        billingUrl: params.billingUrl,
      },
      detailsHtml: emailDetailCard(
        [
          { label: "Plan", value: escapeHtml(params.planName) },
          { label: "Active until", value: escapeHtml(until) },
        ],
        { title: "Membership" }
      ),
      ctaUrl: params.billingUrl,
    })
  )
}
