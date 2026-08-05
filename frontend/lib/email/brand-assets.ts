import { EMAIL_LOGO_PNG_BASE64 } from "@/lib/email/brand-logo-data"
import type { EmailAttachment } from "./send"

/**
 * Simple Content-ID (no @domain) — most reliable with Gmail / Google Workspace SMTP.
 * HTML must use: <img src="cid:ih-logo" />
 */
export const EMAIL_LOGO_CONTENT_ID = "ih-logo"

let cachedLogoAttachment: EmailAttachment | null | undefined

function buildLogoAttachment(base64: string): EmailAttachment {
  return {
    filename: "impact-hub-nairobi-logo.png",
    content: base64,
    contentType: "image/png",
    contentId: EMAIL_LOGO_CONTENT_ID,
    encoding: "base64",
    inline: true,
  }
}

export function hasEmbeddedEmailLogo(): boolean {
  return Boolean(EMAIL_LOGO_PNG_BASE64?.length)
}

/** Inline image src for email HTML (paired with {@link getEmailLogoAttachment}). */
export function getEmailLogoCidSrc(): string {
  return `cid:${EMAIL_LOGO_CONTENT_ID}`
}

/** Logo attachment for outgoing mail — uses bundled base64 (works on Vercel). */
export function getEmailLogoAttachment(): EmailAttachment | null {
  if (cachedLogoAttachment !== undefined) {
    return cachedLogoAttachment
  }

  if (!EMAIL_LOGO_PNG_BASE64?.length) {
    console.warn("[EMAIL] EMAIL_LOGO_PNG_BASE64 is empty — logo will not be attached")
    cachedLogoAttachment = null
    return null
  }

  cachedLogoAttachment = buildLogoAttachment(EMAIL_LOGO_PNG_BASE64)
  return cachedLogoAttachment
}

/**
 * Always attach the inline logo unless the caller already provided it,
 * or EMAIL_BRAND_LOGO_URL is set (hosted URL mode — no CID needed).
 */
export function mergeEmailAttachments(
  attachments?: EmailAttachment[]
): EmailAttachment[] | undefined {
  const extras = attachments ?? []

  // Hosted logo mode: skip CID attachment to keep emails small
  const hostedOverride =
    process.env.EMAIL_BRAND_LOGO_URL?.trim() ||
    process.env.NEXT_PUBLIC_BRAND_LOGO_URL?.trim()
  if (hostedOverride) {
    return extras.length > 0 ? extras : undefined
  }

  const logo = getEmailLogoAttachment()
  if (!logo) {
    return extras.length > 0 ? extras : undefined
  }

  const hasLogo = extras.some((file) => file.contentId === EMAIL_LOGO_CONTENT_ID)
  const merged = hasLogo ? extras : [logo, ...extras]
  return merged.length > 0 ? merged : undefined
}
