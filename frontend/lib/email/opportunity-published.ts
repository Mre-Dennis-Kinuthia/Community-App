import { getEmailFrom } from "./config"
import { sendEmail, type SendEmailResult } from "./send"
import { escapeHtml, layoutEmail } from "./templates"
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
  const greeting = params.name?.trim().split(/\s+/)[0]
    ? `Hi ${escapeHtml(params.name.trim().split(/\s+/)[0])},`
    : "Hi,"
  const detailUrl = getCommunityOpportunityUrl(params.opportunityId)
  const summary = params.summary?.trim()
  const sourceLine = params.source?.trim()
    ? `<p style="margin:0 0 12px;font-size:13px;color:#71717a;">Source: ${escapeHtml(params.source.trim())}</p>`
    : ""

  const bodyHtml = `
    <p>${greeting}</p>
    <p>We've scouted a new opportunity that may be relevant for your impact journey.</p>
    <p><strong>${escapeHtml(params.title)}</strong></p>
    ${sourceLine}
    ${summary ? `<p>${escapeHtml(summary)}</p>` : ""}
    <p style="font-size:13px;color:#71717a;">Applications are hosted externally — review details on the platform first.</p>
  `

  return sendEmail({
    from: getEmailFrom(),
    to: params.to,
    subject: `New opportunity: ${params.title}`,
    html: layoutEmail({
      title: "New community opportunity",
      bodyHtml,
      ctaLabel: "View & apply",
      ctaUrl: detailUrl,
    }),
    text: [
      greeting.replace(/<[^>]+>/g, ""),
      `New opportunity: ${params.title}`,
      sourceLine ? `Source: ${params.source}` : "",
      summary ?? "",
      detailUrl,
    ]
      .filter(Boolean)
      .join("\n\n"),
  })
}
