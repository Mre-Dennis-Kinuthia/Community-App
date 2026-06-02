/**
 * Client-safe image helpers (no Prisma/Node imports).
 * Server upload/read: @/lib/stored-image-server
 */

export const STORED_IMAGE_CATEGORIES = [
  "profile",
  "event_cover",
  "news_cover",
  "project_cover",
  "partner_logo",
  "general",
] as const

export type StoredImageCategory = (typeof STORED_IMAGE_CATEGORIES)[number]

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

const MAX_BYTES: Record<StoredImageCategory, number> = {
  profile: 2 * 1024 * 1024,
  event_cover: 10 * 1024 * 1024,
  news_cover: 10 * 1024 * 1024,
  project_cover: 10 * 1024 * 1024,
  partner_logo: 5 * 1024 * 1024,
  general: 10 * 1024 * 1024,
}

const MEMBER_CATEGORIES: StoredImageCategory[] = ["profile", "project_cover"]
const ADMIN_CATEGORIES: StoredImageCategory[] = [
  "event_cover",
  "news_cover",
  "project_cover",
  "partner_logo",
  "general",
]

export function isStoredImageCategory(value: string): value is StoredImageCategory {
  return (STORED_IMAGE_CATEGORIES as readonly string[]).includes(value)
}

export function maxBytesForCategory(category: StoredImageCategory): number {
  return MAX_BYTES[category]
}

export function categoryAllowedForMember(category: StoredImageCategory): boolean {
  return MEMBER_CATEGORIES.includes(category)
}

export function categoryAllowedForAdmin(category: StoredImageCategory): boolean {
  return ADMIN_CATEGORIES.includes(category) || category === "profile"
}

/** Canonical path saved on User.image, Event.imageUrl, etc. */
export function storedImagePath(id: string): string {
  return `/api/images/${id}`
}

const STORED_PATH_RE = /^\/api\/images\/([a-z0-9]+)$/i

export function parseStoredImageId(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const match = value.trim().match(STORED_PATH_RE)
  return match?.[1] ?? null
}

export function isStoredImageRef(value: string | null | undefined): boolean {
  return parseStoredImageId(value) != null
}

/** Resolve stored path or external URL for <img src>. */
export function getImageDisplayUrl(
  value: string | null | undefined,
  options?: { baseUrl?: string }
): string | undefined {
  if (!value?.trim()) return undefined
  const trimmed = value.trim()
  if (trimmed.startsWith("/api/images/")) {
    const base =
      options?.baseUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "")
    return `${base.replace(/\/$/, "")}${trimmed}`
  }
  return trimmed
}
