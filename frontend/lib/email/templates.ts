import { getAppBaseUrl } from "@/lib/app-url"
import { getBrandLogoUrl } from "@/lib/brand"
import { HUB_CONTACT_EMAIL } from "@/lib/hub-contact"
import { eventTimezone } from "@/lib/event-datetime"

/** Impact Hub Nairobi brand palette for email clients (inline styles only). */
export const EMAIL_BRAND = {
  primary: "#822929",
  primaryDark: "#0a1f38",
  navy: "#1c395c",
  accent: "#ffd546",
  primaryLight: "#fdf2f4",
  background: "#faf9f6",
  surface: "#FFFFFF",
  text: "#0a1f38",
  textMuted: "#1c395c",
  border: "#edeff2",
  footerBg: "#f3f5f8",
} as const

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

export function emailGreeting(name?: string | null): string {
  const greeting = name?.trim() ? `Hi ${escapeHtml(name.trim())},` : "Hi there,"
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${EMAIL_BRAND.text};">${greeting}</p>`
}

export function emailParagraph(html: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${EMAIL_BRAND.text};">${html}</p>`
}

export function emailMutedNote(text: string): string {
  return `<p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:${EMAIL_BRAND.textMuted};">${text}</p>`
}

export function emailDetailCard(
  rows: Array<{ label: string; value: string }>,
  options?: { title?: string }
): string {
  const titleRow = options?.title
    ? `<tr>
        <td colspan="2" style="padding:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${EMAIL_BRAND.primary};">
          ${escapeHtml(options.title)}
        </td>
      </tr>`
    : ""

  const body = rows
    .map(
      (row) => `<tr>
        <td style="padding:6px 12px 6px 0;font-size:13px;color:${EMAIL_BRAND.textMuted};vertical-align:top;white-space:nowrap;">${escapeHtml(row.label)}</td>
        <td style="padding:6px 0;font-size:14px;font-weight:600;color:${EMAIL_BRAND.text};vertical-align:top;">${row.value}</td>
      </tr>`
    )
    .join("")

  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;background:${EMAIL_BRAND.primaryLight};border:1px solid ${EMAIL_BRAND.border};border-radius:10px;">
    <tr>
      <td style="padding:18px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          ${titleRow}
          ${body}
        </table>
      </td>
    </tr>
  </table>`
}

export function emailHighlightBox(html: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;">
    <tr>
      <td style="padding:16px 18px;background:${EMAIL_BRAND.footerBg};border-left:4px solid ${EMAIL_BRAND.primary};border-radius:0 8px 8px 0;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.text};">
        ${html}
      </td>
    </tr>
  </table>`
}

function emailLogoHeader(): string {
  const logoUrl = getBrandLogoUrl()
  const appUrl = getAppBaseUrl()
  return `<a href="${escapeHtml(appUrl)}" style="display:inline-block;text-decoration:none;line-height:0;">
    <img src="${escapeHtml(logoUrl)}" alt="Impact Hub Nairobi" width="200" height="auto" style="display:block;max-width:200px;height:auto;border:0;" />
  </a>`
}

function emailFooter(): string {
  const appUrl = getAppBaseUrl()
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${EMAIL_BRAND.footerBg};border-top:1px solid ${EMAIL_BRAND.border};">
    <tr>
      <td style="padding:24px 28px;text-align:center;">
        <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${EMAIL_BRAND.primaryDark};">Impact Hub Nairobi</p>
        <p style="margin:0 0 14px;font-size:12px;line-height:1.5;color:${EMAIL_BRAND.textMuted};opacity:0.75;">
          For Impact Startups &amp; Innovators<br />
          Innovation · Connection · Impact
        </p>
        <p style="margin:0 0 14px;font-size:13px;">
          <a href="${escapeHtml(appUrl)}" style="color:${EMAIL_BRAND.primary};text-decoration:none;font-weight:600;">Visit platform</a>
          <span style="color:${EMAIL_BRAND.border};margin:0 8px;">|</span>
          <a href="mailto:${escapeHtml(HUB_CONTACT_EMAIL)}" style="color:${EMAIL_BRAND.primary};text-decoration:none;font-weight:600;">Contact us</a>
        </p>
        <p style="margin:0;font-size:11px;line-height:1.5;color:#A1A1AA;">
          You received this email from the Impact Hub Nairobi community platform.<br />
          If you have questions, reply to this message or email ${escapeHtml(HUB_CONTACT_EMAIL)}.
        </p>
      </td>
    </tr>
  </table>`
}

function emailCtaButton(label: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px 0 8px;">
    <tr>
      <td style="border-radius:8px;background:${EMAIL_BRAND.primary};">
        <a href="${escapeHtml(url)}"
           style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;letter-spacing:0.01em;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`
}

export function emailUnsubscribeFooter(unsubscribeUrl: string): string {
  return emailMutedNote(
    `You can <a href="${escapeHtml(unsubscribeUrl)}" style="color:${EMAIL_BRAND.primary};text-decoration:underline;">unsubscribe</a> from these emails at any time.`
  )
}

export function layoutEmail(params: {
  preheader?: string
  title: string
  bodyHtml: string
  ctaLabel?: string
  ctaUrl?: string
  eyebrow?: string
  footerExtraHtml?: string
}): string {
  const { preheader, title, bodyHtml, ctaLabel, ctaUrl, eyebrow = "Impact Hub Nairobi", footerExtraHtml } = params
  const ctaBlock = ctaLabel && ctaUrl ? emailCtaButton(ctaLabel, ctaUrl) : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(title)}</title>
  ${preheader ? `<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:${EMAIL_BRAND.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${EMAIL_BRAND.text};-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${EMAIL_BRAND.background};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:${EMAIL_BRAND.surface};border-radius:12px;overflow:hidden;border:1px solid ${EMAIL_BRAND.border};box-shadow:0 4px 24px rgba(24,24,27,0.06);">
          <tr>
            <td style="height:5px;background:linear-gradient(90deg, ${EMAIL_BRAND.primaryDark} 0%, ${EMAIL_BRAND.navy} 45%, ${EMAIL_BRAND.primary} 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px 32px 20px;text-align:left;">
              ${emailLogoHeader()}
              <p style="margin:20px 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${EMAIL_BRAND.primary};">
                ${escapeHtml(eyebrow)}
              </p>
              <h1 style="margin:0;font-size:26px;line-height:1.25;font-weight:700;color:${EMAIL_BRAND.text};letter-spacing:-0.02em;">
                ${escapeHtml(title)}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 32px 32px;font-size:15px;line-height:1.65;color:${EMAIL_BRAND.text};">
              ${bodyHtml}
              ${ctaBlock}
              ${footerExtraHtml ?? ""}
            </td>
          </tr>
          <tr>
            <td style="padding:0;">
              ${emailFooter()}
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:11px;color:#A1A1AA;text-align:center;">
          © ${new Date().getFullYear()} Impact Hub Nairobi
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}
