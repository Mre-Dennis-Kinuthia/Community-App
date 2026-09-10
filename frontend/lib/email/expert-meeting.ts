import { getAdminAppBaseUrl, getAppBaseUrl } from "@/lib/app-url"
import { expertPublicPath, meetingFormatLabel } from "@/lib/experts"
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
}

function profileUrl(slug: string) {
  return `${getAppBaseUrl()}${expertPublicPath({ id: slug, slug })}`
}

function staffInboxUrl() {
  return `${getAdminAppBaseUrl()}/dashboard/support`
}

export async function sendExpertMeetingExpertEmail(
  payload: ExpertMeetingEmailPayload
): Promise<SendEmailResult> {
  const rows = [
    { label: "Member", value: escapeHtml(payload.requesterName) },
    { label: "Email", value: escapeHtml(payload.requesterEmail) },
    { label: "Topic", value: escapeHtml(payload.topic) },
    { label: "Format", value: escapeHtml(meetingFormatLabel(payload.meetingFormat)) },
    {
      label: "Preferred times",
      value: escapeHtml(payload.preferredTimes?.trim() || "Flexible"),
    },
  ]

  const html = layoutEmail({
    eyebrow: "Experts in Residence",
    title: `${payload.requesterName} would like to meet`,
    preheader: `${payload.requesterName} requested a meeting about ${payload.topic}`,
    bodyHtml: `
      ${emailGreeting(payload.expertName)}
      ${emailParagraph(
        `A community member asked to set up a meeting with you through <strong>Impact Hub Nairobi</strong>.`
      )}
      ${emailDetailCard(rows, { title: "Request" })}
      ${emailParagraph(`<strong>What they shared</strong><br />${escapeHtml(payload.message).replace(/\n/g, "<br />")}`)}
      ${emailMutedNote("Reply directly to this email to continue the conversation with the member.")}
    `,
    ctaLabel: "View your profile",
    ctaUrl: profileUrl(payload.expertSlug),
  })

  return sendEmail({
    to: payload.expertEmail,
    subject: `Meeting request: ${payload.topic}`,
    html,
    text: [
      `${payload.requesterName} (${payload.requesterEmail}) asked to meet about ${payload.topic}.`,
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
  const html = layoutEmail({
    eyebrow: "Experts in Residence",
    title: `We’ve sent your request to ${payload.expertName}`,
    preheader: "The expert will follow up to confirm a time",
    bodyHtml: `
      ${emailGreeting(payload.requesterName)}
      ${emailParagraph(
        `Your meeting request with <strong>${escapeHtml(payload.expertName)}</strong> is with them now. They’ll reply by email to confirm a time.`
      )}
      ${emailDetailCard(
        [
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
    subject: `Meeting request sent to ${payload.expertName}`,
    html,
    text: `We’ve sent your meeting request to ${payload.expertName} about ${payload.topic}. They’ll follow up by email.`,
  })
}

export async function sendExpertMeetingStaffEmail(
  payload: ExpertMeetingEmailPayload
): Promise<SendEmailResult> {
  const html = layoutEmail({
    eyebrow: "Experts in Residence",
    title: "New expert meeting request",
    preheader: `${payload.requesterName} → ${payload.expertName}`,
    bodyHtml: `
      ${emailParagraph("A member requested a meeting with an Expert in Residence.")}
      ${emailDetailCard(
        [
          { label: "Expert", value: escapeHtml(`${payload.expertName} <${payload.expertEmail}>`) },
          { label: "Member", value: escapeHtml(`${payload.requesterName} <${payload.requesterEmail}>`) },
          { label: "Topic", value: escapeHtml(payload.topic) },
          { label: "Format", value: escapeHtml(meetingFormatLabel(payload.meetingFormat)) },
          {
            label: "Preferred times",
            value: escapeHtml(payload.preferredTimes?.trim() || "Flexible"),
          },
        ],
        { title: "Meeting" }
      )}
      ${emailParagraph(`<strong>Message</strong><br />${escapeHtml(payload.message).replace(/\n/g, "<br />")}`)}
    `,
    ctaLabel: "Open support inbox",
    ctaUrl: staffInboxUrl(),
  })

  return sendEmail({
    to: getEmailStaffTo(),
    subject: `Experts in Residence · Meeting — ${payload.expertName}`,
    html,
    text: `${payload.requesterName} requested a meeting with ${payload.expertName} about ${payload.topic}.`,
    replyTo: payload.requesterEmail,
  })
}
