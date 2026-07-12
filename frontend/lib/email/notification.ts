import { getAppBaseUrl } from "@/lib/app-url"
import { escapeHtml } from "./templates"
import type { SendEmailResult } from "./send"
import {
  sendFromTemplate,
  type SendFromTemplateResult,
} from "./resolve-template"

export function resolveNotificationActionUrl(actionUrl?: string | null): string | undefined {
  if (!actionUrl?.trim()) return undefined
  const trimmed = actionUrl.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const base = getAppBaseUrl()
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`
}

function asSendResult(result: SendFromTemplateResult): SendEmailResult {
  if ("skipped" in result && result.skipped) {
    return { ok: true, id: `skipped:${result.reason}` }
  }
  return result
}

export async function sendNotificationEmail(params: {
  to: string
  name?: string | null
  title: string
  message: string
  actionUrl?: string | null
}): Promise<SendEmailResult> {
  const actionFullUrl = resolveNotificationActionUrl(params.actionUrl)

  return asSendResult(
    await sendFromTemplate({
      key: "notification",
      to: params.to,
      name: params.name,
      vars: {
        notificationTitle: params.title,
        message: escapeHtml(params.message),
        actionUrl: actionFullUrl || "",
      },
      ctaUrl: actionFullUrl,
    })
  )
}
