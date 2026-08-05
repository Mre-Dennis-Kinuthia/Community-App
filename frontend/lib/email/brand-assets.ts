import fs from "node:fs"
import path from "node:path"
import { BRAND_LOGO_PATH } from "@/lib/brand-meta"
import type { EmailAttachment } from "./send"

/** Content-ID referenced in HTML: `<img src="cid:…" />` */
export const EMAIL_LOGO_CONTENT_ID = "impact-hub-logo@impacthubnairobi"

let cachedLogoAttachment: EmailAttachment | null | undefined

function resolveLogoFilePath(): string {
  return path.join(process.cwd(), "public", BRAND_LOGO_PATH.replace(/^\//, ""))
}

/** Inline image src for email HTML (paired with {@link getEmailLogoAttachment}). */
export function getEmailLogoImgSrc(): string {
  return `cid:${EMAIL_LOGO_CONTENT_ID}`
}

/** Read the brand PNG once and reuse for subsequent sends in the same process. */
export function getEmailLogoAttachment(): EmailAttachment | null {
  if (cachedLogoAttachment !== undefined) {
    return cachedLogoAttachment
  }

  try {
    const logoPath = resolveLogoFilePath()
    const buffer = fs.readFileSync(logoPath)
    cachedLogoAttachment = {
      filename: "impact-hub-nairobi-logo.png",
      content: buffer.toString("base64"),
      contentType: "image/png",
      contentId: EMAIL_LOGO_CONTENT_ID,
      encoding: "base64",
    }
    return cachedLogoAttachment
  } catch (error) {
    console.warn("[EMAIL] Brand logo file not found for inline attachment:", error)
    cachedLogoAttachment = null
    return null
  }
}

export function mergeEmailAttachments(
  attachments?: EmailAttachment[]
): EmailAttachment[] | undefined {
  const extras = attachments ?? []
  const logo = getEmailLogoAttachment()
  if (!logo) {
    return extras.length > 0 ? extras : undefined
  }

  const hasLogo = extras.some((file) => file.contentId === EMAIL_LOGO_CONTENT_ID)
  const merged = hasLogo ? extras : [logo, ...extras]
  return merged.length > 0 ? merged : undefined
}
