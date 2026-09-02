/**
 * Canonical public URL for an event (short share link preferred).
 */
import { getAppBaseUrl } from "@/lib/app-url"

export function getEventPublicPath(event: {
  id: string
  shortCode?: string | null
  slug?: string | null
}): string {
  if (event.shortCode) {
    return `/e/${event.shortCode}`
  }
  if (event.slug) {
    return `/events/${event.slug}`
  }
  return `/events/${event.id}`
}

export function getEventPublicUrl(event: {
  id: string
  shortCode?: string | null
  slug?: string | null
}): string {
  const root = getAppBaseUrl()
  return `${root}${getEventPublicPath(event)}`
}

export function getEventOpenGraphImageUrl(event: {
  id: string
  shortCode?: string | null
  slug?: string | null
}): string {
  // Cache-bust key when share-preview rendering changes.
  return `${getEventPublicUrl(event)}/opengraph-image?v=social3`
}

export function getEventShareText(title: string, startDate?: Date | string): string {
  const datePart =
    startDate != null
      ? new Intl.DateTimeFormat("en-KE", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date(startDate))
      : null
  return datePart ? `Join us: ${title} · ${datePart}` : `Join us: ${title}`
}
