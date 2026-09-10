import { getAdminAppBaseUrl, getAppBaseUrl } from "@/lib/app-url"
import {
  EIR_DASHBOARD_PATH,
  expertPublicPath,
  expertRequestTypeLabel,
  meetingFormatLabel,
} from "@/lib/experts"
import { getEmailStaffTo } from "./config"
import { sendEmail, type SendEmailResult } from "./send"
import {
  escapeHtml,
  layoutEmail,
  emailGreeting,
  emailParagraph,
  emailDetailCard,
  emailMutedNote,
} from "./templates"

export type ExpertMeetingEmailPayload = {
  expertName: string
  expertEmail: string
  expertSlug: string
  requesterName: string
  requesterEmail: string
  topic: string
  message: string
  preferredTimes?: string | null
  meetingFormat: string
  requestType?: string
}

function profileUrl(slug: string) {
  return `${getAppBaseUrl()}${expertPublicPath({ id: slug, slug })}`
}

function dashboardUrl() {
  return `${getAppBaseUrl()}${EIR_DASHBOARD_PATH}`
}

function staffInboxUrl() {
  return `${getAdminAppBaseUrl()}/dashboard/support`
}

function requestTypeLabel(payload: ExpertMeetingEmailPayload) {
  return expertRequestTypeLabel(payload.requestType || "clinic")
}

export async function sendExpertMeetingExpertEmail(
  payload: ExpertMeetingEmailPayload
): Promise<SendEmailResult> {
  const typeLabel = requestTypeLabel(payload)
  const rows = [
    { label: "Member", value: escapeHtml(payload.requesterName) },
    { label: "Email", value: escapeHtml(payload.requesterEmail) },
    { label: "Interest", value: escapeHtml(typeLabel) },
    { label: "Topic", value: escapeHtml(payload.topic) },
    { label: "Format", value: escapeHtml(meetingFormatLabel(payload.meetingFormat)) },
    {
      label: "Preferred times",
      value: escapeHtml(payload.preferredTimes?.trim() || "Flexible"),
    },
  ]

  const html = layoutEmail({
    eyebrow: "Experts in Residence",
    title: `${payload.requesterName} is interested in ${typeLabel.toLowerCase()}`,
    preheader: `${payload.requesterName} requested ${typeLabel.toLowerCase()} about ${payload.topic}`,
    bodyHtml: `
      ${emailGreeting(payload.expertName)}
      ${emailParagraph(
        `A community member asked about <strong>${escapeHtml(typeLabel.toLowerCase())}</strong> with you through <strong>Impact Hub Nairobi</strong>.`
      )}
      ${emailDetailCard(rows, { title: "Request" })}
      ${emailParagraph(`<strong>What they shared</strong><br />${escapeHtml(payload.message).replace(/\n/g, "<br />")}`)}
      ${emailMutedNote("Reply directly to this email to continue the conversation with the member.")}
    `,
    ctaLabel: "Open your EIR dashboard",
    ctaUrl: dashboardUrl(),
  })

  return sendEmail({
    to: payload.expertEmail,
    subject: `${typeLabel} request: ${payload.topic}`,
    html,
    text: [
      `${payload.requesterName} (${payload.requesterEmail}) asked about ${typeLabel.toLowerCase()}: ${payload.topic}.`,
      `Format: ${meetingFormatLabel(payload.meetingFormat)}`,
      `Preferred times: ${payload.preferredTimes?.trim() || "Flexible"}`,
      "",
      payload.message,
    ].join("\n"),
    replyTo: payload.requesterEmail,
  })
}

export async function sendExpertMeetingMemberEmail(
  payload: ExpertMeetingEmailPayload
): Promise<SendEmailResult> {
  const typeLabel = requestTypeLabel(payload)
  const html = layoutEmail({
    eyebrow: "Experts in Residence",
    title: `We’ve sent your ${typeLabel.toLowerCase()} request to ${payload.expertName}`,
    preheader: "The expert will follow up to confirm next steps",
    bodyHtml: `
      ${emailGreeting(payload.requesterName)}
      ${emailParagraph(
        `Your ${escapeHtml(typeLabel.toLowerCase())} request with <strong>${escapeHtml(payload.expertName)}</strong> is with them now. They’ll reply by email to confirm next steps.`
      )}
      ${emailDetailCard(
        [
          { label: "Interest", value: escapeHtml(typeLabel) },
          { label: "Topic", value: escapeHtml(payload.topic) },
          { label: "Format", value: escapeHtml(meetingFormatLabel(payload.meetingFormat)) },
        ],
        { title: "Your request" }
      )}
    `,
    ctaLabel: "Back to profile",
    ctaUrl: profileUrl(payload.expertSlug),
  })

  return sendEmail({
    to: payload.requesterEmail,
    subject: `${typeLabel} request sent to ${payload.expertName}`,
    html,
    text: `We’ve sent your ${typeLabel.toLowerCase()} request to ${payload.expertName} about ${payload.topic}. They’ll follow up by email.`,
  })
}

export async function sendExpertMeetingStaffEmail(
  payload: ExpertMeetingEmailPayload
): Promise<SendEmailResult> {
  const typeLabel = requestTypeLabel(payload)
  const html = layoutEmail({
    eyebrow: "Experts in Residence",
    title: `New ${typeLabel.toLowerCase()} request`,
    preheader: `${payload.requesterName} → ${payload.expertName}`,
    bodyHtml: `
      ${emailParagraph(`A member requested ${escapeHtml(typeLabel.toLowerCase())} with an Expert in Residence.`)}
      ${emailDetailCard(
        [
          { label: "Expert", value: escapeHtml(`${payload.expertName} <${payload.expertEmail}>`) },
          { label: "Member", value: escapeHtml(`${payload.requesterName} <${payload.requesterEmail}>`) },
          { label: "Interest", value: escapeHtml(typeLabel) },
          { label: "Topic", value: escapeHtml(payload.topic) },
          { label: "Format", value: escapeHtml(meetingFormatLabel(payload.meetingFormat)) },
          {
            label: "Preferred times",
            value: escapeHtml(payload.preferredTimes?.trim() || "Flexible"),
          },
        ],
        { title: "Request" }
      )}
      ${emailParagraph(`<strong>Message</strong><br />${escapeHtml(payload.message).replace(/\n/g, "<br />")}`)}
    `,
    ctaLabel: "Open support inbox",
    ctaUrl: staffInboxUrl(),
  })

  return sendEmail({
    to: getEmailStaffTo(),
    subject: `Experts in Residence · ${typeLabel} — ${payload.expertName}`,
    html,
    text: `${payload.requesterName} requested ${typeLabel.toLowerCase()} with ${payload.expertName} about ${payload.topic}.`,
    replyTo: payload.requesterEmail,
  })
}
