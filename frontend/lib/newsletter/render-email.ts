import { EMAIL_BRAND, escapeHtml } from "@/lib/email/templates"
import { getEmailBrandLogoUrl } from "@/lib/brand"
import { HUB_CONTACT_EMAIL, HUB_MAILING_ADDRESS } from "@/lib/hub-contact"
import type { NewsletterSection } from "./section-schema"
import { NEWSLETTER_SECTION_ACCENTS } from "./section-schema"

export type NewsletterBrand = {
  primary: string
  accent: string
  primaryDark: string
  navy: string
  background: string
  surface: string
  text: string
  textMuted: string
  border: string
  footerBg: string
}

export function resolveNewsletterBrand(overrides?: {
  brandPrimary?: string | null
  brandAccent?: string | null
}): NewsletterBrand {
  const brand = EMAIL_BRAND as typeof EMAIL_BRAND & { navy?: string }
  return {
    primary: overrides?.brandPrimary?.trim() || brand.primary,
    accent: overrides?.brandAccent?.trim() || brand.accent,
    primaryDark: brand.primaryDark,
    navy: brand.navy || "#1c395c",
    background: brand.background,
    surface: brand.surface,
    text: brand.text,
    textMuted: brand.textMuted,
    border: brand.border,
    footerBg: brand.footerBg,
  }
}

function absUrl(url: string, appBaseUrl: string): string {
  if (!url) return appBaseUrl
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("/")) return `${appBaseUrl}${url}`
  return url
}

function ctaButton(
  label: string,
  url: string,
  brand: NewsletterBrand,
  align: "left" | "center" = "center"
): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0;">
    <tr>
      <td align="${align}">
        <table cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="border-radius:8px;background:${brand.primary};">
              <a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;">
                ${escapeHtml(label)}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`
}

function renderSectionHtml(
  section: NewsletterSection,
  ctx: {
    brand: NewsletterBrand
    appBaseUrl: string
    unsubscribeUrl?: string | null
    wrapLink?: (url: string) => string
  }
): string {
  const { brand, appBaseUrl, unsubscribeUrl, wrapLink } = ctx
  const link = (url: string) =>
    wrapLink ? wrapLink(absUrl(url, appBaseUrl)) : absUrl(url, appBaseUrl)

  switch (section.type) {
    case "header": {
      const logo = getEmailBrandLogoUrl()
      const logoBlock = section.showLogo !== false
        ? `<img src="${escapeHtml(logo)}" alt="Impact Hub Nairobi" width="160" style="display:block;max-width:160px;height:auto;border:0;" />`
        : ""
      return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 8px;">
        <tr>
          <td style="padding:8px 0 16px;border-bottom:1px solid ${brand.border};">
            ${logoBlock}
            ${
              section.eyebrow
                ? `<p style="margin:12px 0 0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${brand.primary};">${escapeHtml(section.eyebrow)}</p>`
                : ""
            }
          </td>
        </tr>
      </table>`
    }
    case "hero": {
      const img = section.imageUrl
        ? `<img src="${escapeHtml(absUrl(section.imageUrl, appBaseUrl))}" alt="" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:10px;margin:0 0 18px;" />`
        : ""
      const cta =
        section.cta?.label && section.cta?.url
          ? ctaButton(section.cta.label, link(section.cta.url), brand)
          : ""
      return `${img}
        <h1 style="margin:0 0 10px;font-size:28px;line-height:1.25;font-weight:700;color:${brand.text};letter-spacing:-0.02em;">${escapeHtml(section.headline)}</h1>
        ${
          section.subcopy
            ? `<p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:${brand.textMuted};">${escapeHtml(section.subcopy)}</p>`
            : ""
        }
        ${cta}`
    }
    case "text":
      return `<div style="margin:12px 0;font-size:15px;line-height:1.65;color:${brand.text};">${section.html}</div>`
    case "image": {
      const img = `<img src="${escapeHtml(absUrl(section.imageUrl, appBaseUrl))}" alt="${escapeHtml(section.alt || "")}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:10px;" />`
      const wrapped = section.linkUrl
        ? `<a href="${escapeHtml(link(section.linkUrl))}" style="text-decoration:none;">${img}</a>`
        : img
      return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;">
        <tr><td>${wrapped}</td></tr>
        ${
          section.caption
            ? `<tr><td style="padding-top:8px;font-size:13px;color:${brand.textMuted};text-align:center;">${escapeHtml(section.caption)}</td></tr>`
            : ""
        }
      </table>`
    }
    case "button":
      return ctaButton(section.label, link(section.url), brand, section.align ?? "center")
    case "divider":
      return `<hr style="border:none;border-top:1px solid ${brand.border};margin:24px 0;" />`
    case "spacer": {
      const h = section.size === "sm" ? 12 : section.size === "lg" ? 40 : 24
      return `<div style="height:${h}px;line-height:${h}px;font-size:0;">&nbsp;</div>`
    }
    case "columns": {
      const leftImg = section.leftImageUrl
        ? `<img src="${escapeHtml(absUrl(section.leftImageUrl, appBaseUrl))}" alt="${escapeHtml(section.leftAlt || "")}" width="260" style="display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:10px;margin:0 0 10px;" />`
        : ""
      const rightImg = section.rightImageUrl
        ? `<img src="${escapeHtml(absUrl(section.rightImageUrl, appBaseUrl))}" alt="${escapeHtml(section.rightAlt || "")}" width="260" style="display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:10px;margin:0 0 10px;" />`
        : ""
      const leftCopy = section.leftHtml
        ? `<div style="font-size:14px;line-height:1.6;color:${brand.text};">${section.leftHtml}</div>`
        : ""
      const rightCopy = section.rightHtml
        ? `<div style="font-size:14px;line-height:1.6;color:${brand.text};">${section.rightHtml}</div>`
        : ""
      return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;">
        <tr>
          <td class="ih-col" width="50%" valign="top" style="width:50%;padding-right:10px;font-size:14px;line-height:1.6;color:${brand.text};">
            ${leftImg}${leftCopy}
          </td>
          <td class="ih-col" width="50%" valign="top" style="width:50%;padding-left:10px;font-size:14px;line-height:1.6;color:${brand.text};">
            ${rightImg}${rightCopy}
          </td>
        </tr>
      </table>`
    }
    case "news_card": {
      const title = section.title || "Community news"
      const excerpt = section.excerpt || ""
      const url = section.url ? link(section.url) : appBaseUrl
      const img = section.imageUrl
        ? `<img src="${escapeHtml(absUrl(section.imageUrl, appBaseUrl))}" alt="" width="160" style="display:block;width:160px;max-width:100%;height:auto;border:0;border-radius:8px;" />`
        : ""
      return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0;background:${brand.footerBg};border:1px solid ${brand.border};border-radius:10px;">
        <tr>
          <td style="padding:16px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                ${img ? `<td width="168" valign="top" style="padding-right:14px;">${img}</td>` : ""}
                <td valign="top">
                  <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${brand.primary};">From the news</p>
                  <h3 style="margin:0 0 8px;font-size:18px;line-height:1.3;color:${brand.text};">
                    <a href="${escapeHtml(url)}" style="color:${brand.text};text-decoration:none;">${escapeHtml(title)}</a>
                  </h3>
                  ${excerpt ? `<p style="margin:0 0 10px;font-size:14px;line-height:1.55;color:${brand.textMuted};">${escapeHtml(excerpt)}</p>` : ""}
                  <a href="${escapeHtml(url)}" style="font-size:14px;font-weight:700;color:${brand.primary};text-decoration:none;">Read more →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`
    }
    case "section_heading": {
      const accent =
        NEWSLETTER_SECTION_ACCENTS[section.accent ?? "maroon"] ??
        NEWSLETTER_SECTION_ACCENTS.maroon
      return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:28px 0 16px;">
        <tr>
          <td style="height:8px;background:${accent.bar};font-size:0;line-height:0;">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:14px 0 2px;">
            <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${accent.label};">${escapeHtml(section.label)}</p>
          </td>
        </tr>
      </table>`
    }
    case "event_card": {
      const img = section.imageUrl
        ? `<img src="${escapeHtml(absUrl(section.imageUrl, appBaseUrl))}" alt="" width="220" style="display:block;width:100%;max-width:220px;height:auto;border:0;border-radius:10px;" />`
        : ""
      const cta =
        section.cta?.label && section.cta?.url
          ? `<p style="margin:12px 0 0;"><a href="${escapeHtml(link(section.cta.url))}" style="display:inline-block;padding:10px 18px;font-size:13px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:8px;background:${brand.primary};">${escapeHtml(section.cta.label)}</a></p>`
          : ""
      const meta = [section.dateLine, section.location].filter(Boolean).join(" · ")
      return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0 8px;border:1px solid ${brand.border};border-radius:12px;background:${brand.footerBg};">
        <tr>
          <td style="padding:16px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                ${img ? `<td width="236" valign="top" style="padding-right:16px;">${img}</td>` : ""}
                <td valign="top">
                  ${
                    section.kicker
                      ? `<p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${brand.primary};">${escapeHtml(section.kicker)}</p>`
                      : ""
                  }
                  <h3 style="margin:0 0 8px;font-size:18px;line-height:1.3;color:${brand.text};">${escapeHtml(section.title)}</h3>
                  ${meta ? `<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${brand.primary};">${escapeHtml(meta)}</p>` : ""}
                  ${section.body ? `<p style="margin:0;font-size:14px;line-height:1.55;color:${brand.textMuted};">${escapeHtml(section.body)}</p>` : ""}
                  ${cta}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`
    }
    case "footer": {
      const unsub =
        section.showUnsubscribe !== false && unsubscribeUrl
          ? `<p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:${brand.textMuted};">
              You can <a href="${escapeHtml(unsubscribeUrl)}" style="color:${brand.primary};text-decoration:underline;">unsubscribe</a> at any time.
            </p>`
          : ""
      return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:28px 0 0;border-top:1px solid ${brand.border};">
        <tr>
          <td style="padding:20px 0 0;text-align:center;">
            <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${brand.primaryDark};">Impact Hub Nairobi</p>
            ${
              section.note
                ? `<p style="margin:0 0 10px;font-size:12px;line-height:1.5;color:${brand.textMuted};">${escapeHtml(section.note)}</p>`
                : ""
            }
            <p style="margin:0 0 10px;font-size:11px;line-height:1.5;color:${brand.textMuted};">${escapeHtml(HUB_MAILING_ADDRESS)}</p>
            <p style="margin:0;font-size:12px;">
              <a href="${escapeHtml(appBaseUrl)}" style="color:${brand.primary};text-decoration:none;font-weight:600;">Visit platform</a>
              <span style="color:${brand.border};margin:0 8px;">|</span>
              <a href="mailto:${escapeHtml(HUB_CONTACT_EMAIL)}" style="color:${brand.primary};text-decoration:none;font-weight:600;">Contact</a>
            </p>
            ${unsub}
          </td>
        </tr>
      </table>`
    }
    default:
      return ""
  }
}

export function renderNewsletterEmailHtml(params: {
  sections: NewsletterSection[]
  subject: string
  preheader?: string | null
  brandPrimary?: string | null
  brandAccent?: string | null
  appBaseUrl: string
  unsubscribeUrl?: string | null
  openPixelUrl?: string | null
  /** Rewrite outbound links for click tracking */
  wrapLink?: (url: string) => string
}): string {
  const brand = resolveNewsletterBrand(params)
  const body = params.sections
    .map((section) =>
      renderSectionHtml(section, {
        brand,
        appBaseUrl: params.appBaseUrl,
        unsubscribeUrl: params.unsubscribeUrl,
        wrapLink: params.wrapLink,
      })
    )
    .join("\n")

  const pixel = params.openPixelUrl
    ? `<img src="${escapeHtml(params.openPixelUrl)}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`
    : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(params.subject)}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .ih-col {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        padding-bottom: 16px !important;
      }
      .ih-col img { width: 100% !important; max-width: 100% !important; height: auto !important; }
    }
  </style>
  ${
    params.preheader
      ? `<span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(params.preheader)}</span>`
      : ""
  }
</head>
<body style="margin:0;padding:0;background:${brand.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${brand.text};">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${brand.background};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:${brand.surface};border-radius:12px;overflow:hidden;border:1px solid ${brand.border};box-shadow:0 4px 24px rgba(24,24,27,0.06);">
          <tr>
            <td style="height:5px;background:linear-gradient(90deg, ${brand.primaryDark} 0%, ${brand.navy} 45%, ${brand.primary} 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 32px 32px;">
              ${body}
              ${pixel}
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

export function newsletterPlainText(sections: NewsletterSection[]): string {
  return sections
    .map((s) => {
      switch (s.type) {
        case "hero":
          return `${s.headline}\n${s.subcopy || ""}`
        case "text":
          return s.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
        case "button":
          return `${s.label}: ${s.url}`
        case "columns":
          return [s.leftHtml, s.rightHtml]
            .map((html) => (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
            .filter(Boolean)
            .join("\n")
        case "news_card":
          return `${s.title || "News"}\n${s.excerpt || ""}\n${s.url || ""}`
        case "section_heading":
          return s.label
        case "event_card":
          return [s.title, s.dateLine, s.location, s.body, s.cta?.url]
            .filter(Boolean)
            .join("\n")
        case "footer":
          return s.note || "Impact Hub Nairobi"
        default:
          return ""
      }
    })
    .filter(Boolean)
    .join("\n\n")
}
