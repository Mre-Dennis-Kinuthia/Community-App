import { getEmailFrom } from "./config"
import { sendEmail, type SendEmailResult } from "./send"
import {
  escapeHtml,
  layoutEmail,
  emailGreeting,
  emailParagraph,
  emailDetailCard,
  emailMutedNote,
} from "./templates"
import { getCommunityOpportunityUrl } from "@/lib/app-url"

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

  const bodyHtml = `
    ${emailGreeting(params.name)}
    ${emailParagraph("We've scouted a new opportunity that may be relevant for your impact journey.")}
    ${emailDetailCard(rows, { title: "Program details" })}
    ${emailMutedNote("Applications are hosted externally — review details on the platform first.")}
  `

  return sendEmail({
    from: getEmailFrom(),
    to: params.to,
    subject: `New opportunity: ${params.title}`,
    html: layoutEmail({
      preheader: params.title,
      title: "New community opportunity",
      eyebrow: "Programs",
      bodyHtml,
      ctaLabel: "View & apply",
      ctaUrl: detailUrl,
    }),
    text: [
      `New opportunity: ${params.title}`,
      params.source ? `Source: ${params.source}` : "",
      summary ?? "",
      detailUrl,
    ]
      .filter(Boolean)
      .join("\n\n"),
  })
}
