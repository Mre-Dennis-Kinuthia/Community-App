import { getAppBaseUrl } from "@/lib/app-url"
import {
  layoutEmail,
  escapeHtml,
  emailGreeting,
  emailParagraph,
  emailMutedNote,
} from "./templates"
import { sendEmail, type SendEmailResult } from "./send"

export function resolveNotificationActionUrl(actionUrl?: string | null): string | undefined {
  if (!actionUrl?.trim()) return undefined
  const trimmed = actionUrl.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const base = getAppBaseUrl()
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`
}

export async function sendNotificationEmail(params: {
  to: string
  name?: string | null
  title: string
  message: string
  actionUrl?: string | null
}): Promise<SendEmailResult> {
  const actionFullUrl = resolveNotificationActionUrl(params.actionUrl)

  const bodyHtml = `
    ${emailGreeting(params.name)}
    ${emailParagraph(escapeHtml(params.message))}
    ${emailMutedNote("You can also find this in your notifications on the community platform.")}
  `

  return sendEmail({
    to: params.to,
    subject: params.title,
    html: layoutEmail({
      preheader: params.message.slice(0, 120),
      title: params.title,
      eyebrow: "Notification",
      bodyHtml,
      ctaLabel: actionFullUrl ? "View in platform" : undefined,
      ctaUrl: actionFullUrl,
    }),
    text: `${params.title}\n\n${params.message}${actionFullUrl ? `\n\n${actionFullUrl}` : ""}`,
  })
}
