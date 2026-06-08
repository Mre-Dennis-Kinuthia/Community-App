import { getAppBaseUrl } from "@/lib/app-url"

/** Public path to the official Impact Hub Nairobi horizontal logo. */
export const BRAND_LOGO_PATH = "/brand/impact-hub-nairobi-logo.png"

/** Square tile width in the source logo asset (334×151 PNG). */
export const BRAND_LOGO_TILE_RATIO = 151 / 334

export function getBrandLogoUrl(): string {
  return `${getAppBaseUrl()}${BRAND_LOGO_PATH}`
}
