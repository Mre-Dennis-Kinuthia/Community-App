/**
 * Canonical public URL for an event (short share link preferred).
 */
export function getEventPublicUrl(event: {
  id: string
  shortCode?: string | null
  slug?: string | null
}): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  const root = base.replace(/\/$/, "")
  if (event.shortCode) {
    return `${root}/e/${event.shortCode}`
  }
  if (event.slug) {
    return `${root}/events/${event.slug}`
  }
  return `${root}/events/${event.id}`
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
