import { getAppBaseUrl } from "@/lib/app-url"
import { getBrandLogoUrl } from "@/lib/brand"
import { eventTimezone } from "@/lib/event-datetime"

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function formatEventWhen(
  startDate: Date | string,
  timezone?: string | null
): string {
  const tz = eventTimezone(timezone)
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: tz,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(startDate))
}

function emailLogoHeader(): string {
  const logoUrl = getBrandLogoUrl()
  return `<a href="${escapeHtml(getAppBaseUrl())}" style="display:inline-block;text-decoration:none;">
    <img src="${escapeHtml(logoUrl)}" alt="Impact Hub Nairobi" width="220" height="auto" style="display:block;max-width:220px;height:auto;border:0;" />
  </a>`
}

export function layoutEmail(params: {
  preheader?: string
  title: string
  bodyHtml: string
  ctaLabel?: string
  ctaUrl?: string
}): string {
  const { preheader, title, bodyHtml, ctaLabel, ctaUrl } = params
  const ctaBlock =
    ctaLabel && ctaUrl
      ? `<p style="margin:24px 0 0;">
          <a href="${escapeHtml(ctaUrl)}"
             style="display:inline-block;background:#A6192E;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;">
            ${escapeHtml(ctaLabel)}
          </a>
        </p>`
      : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;border:1px solid #e4e4e7;">
          <tr>
            <td style="padding:28px 28px 16px;border-bottom:3px solid #802B2B;">
              ${emailLogoHeader()}
              <h1 style="margin:16px 0 0;font-size:22px;line-height:1.3;color:#18181b;">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 28px;font-size:15px;line-height:1.6;color:#3f3f46;">
              ${bodyHtml}
              ${ctaBlock}
              <p style="margin:28px 0 0;font-size:12px;color:#71717a;">
                You received this email from the Impact Hub Nairobi community platform.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
