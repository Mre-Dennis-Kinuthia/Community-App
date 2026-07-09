import { getAppBaseUrl } from "@/lib/app-url"
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

export function getBrandLogoUrl(): string {
  return `${getAppBaseUrl()}${BRAND_LOGO_PATH}`
}

export function getBrandLogoDimensions(height: number): { width: number; height: number } {
  const width = Math.round(height * BRAND_LOGO_ASPECT_RATIO)
  return { width, height }
}

export function getBrandMarkDimensions(size: number): { width: number; height: number } {
  return { width: size, height: size }
}
