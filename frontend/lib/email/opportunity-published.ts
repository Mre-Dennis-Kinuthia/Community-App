import type { SendEmailResult } from "./send"
import { escapeHtml, emailDetailCard } from "./templates"
import { getCommunityOpportunityUrl } from "@/lib/app-url"
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

export async function sendCommunityOpportunityEmail(params: {
  to: string
  name?: string | null
  title: string
  summary?: string | null
  source?: string | null
  opportunityId: string
  applyUrl: string
}): Promise<SendEmailResult> {
  const detailUrl = getCommunityOpportunityUrl(params.opportunityId)
  const summary = params.summary?.trim()
  const rows = [
    { label: "Opportunity", value: escapeHtml(params.title) },
    ...(params.source?.trim()
      ? [{ label: "Source", value: escapeHtml(params.source.trim()) }]
      : []),
    ...(summary ? [{ label: "Summary", value: escapeHtml(summary) }] : []),
  ]

  return asSendResult(
    await sendFromTemplate({
      key: "community_opportunity",
      to: params.to,
      name: params.name,
      vars: {
        opportunityTitle: params.title,
        summary: summary || "",
        source: params.source?.trim() || "",
        detailUrl,
      },
      detailsHtml: emailDetailCard(rows, { title: "Program details" }),
      ctaUrl: detailUrl,
    })
  )
}
