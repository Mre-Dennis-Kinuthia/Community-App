import { getAppBaseUrl, PRODUCTION_APP_ORIGIN } from "@/lib/app-url"
import {
  BRAND_LOGO_ASPECT_RATIO,
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_PATH,
  BRAND_LOGO_SVG_PATH,
  BRAND_LOGO_TILE_RATIO,
  BRAND_LOGO_TILE_SIZE,
  BRAND_LOGO_WIDTH,
  BRAND_MARK_PATH,
  BRAND_MARK_SVG_PATH,
  BRAND_APP_ICON_SVG_PATH,
} from "@/lib/brand-meta"

export {
  BRAND_LOGO_ASPECT_RATIO,
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_PATH,
  BRAND_LOGO_SVG_PATH,
  BRAND_LOGO_TILE_RATIO,
  BRAND_LOGO_TILE_SIZE,
  BRAND_LOGO_WIDTH,
  BRAND_MARK_PATH,
  BRAND_MARK_SVG_PATH,
  BRAND_APP_ICON_SVG_PATH,
}

export { PRODUCTION_APP_ORIGIN }

function isUsablePublicOrigin(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`)
    if (parsed.protocol !== "https:") return false
    const host = parsed.hostname.toLowerCase()
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return false
    return true
  } catch {
    return false
  }
}

/** Absolute logo URL for the web app (may be localhost in local dev). */
export function getBrandLogoUrl(): string {
  return `${getAppBaseUrl()}${BRAND_LOGO_PATH}`
}

/**
 * Absolute HTTPS logo URL for outbound email HTML.
 * Prefer env override, then public app origin, then production fallback.
 * Do not use CID here — Google Workspace SMTP often strips/breaks inline CID images.
 */
export function getEmailBrandLogoUrl(): string {
  const override =
    process.env.EMAIL_BRAND_LOGO_URL?.trim() ||
    process.env.NEXT_PUBLIC_BRAND_LOGO_URL?.trim()
  if (override) {
    const withProtocol = override.startsWith("http") ? override : `https://${override}`
    if (isUsablePublicOrigin(withProtocol)) return withProtocol.replace(/\/$/, "")
  }

  const base = getAppBaseUrl()
  if (isUsablePublicOrigin(base)) {
    return `${base.replace(/\/$/, "")}${BRAND_LOGO_PATH}`
  }

  return `${PRODUCTION_APP_ORIGIN}${BRAND_LOGO_PATH}`
}

export function getBrandLogoDimensions(height: number): { width: number; height: number } {
  const width = Math.round(height * BRAND_LOGO_ASPECT_RATIO)
  return { width, height }
}

export function getBrandMarkDimensions(size: number): { width: number; height: number } {
  return { width: size, height: size }
}
