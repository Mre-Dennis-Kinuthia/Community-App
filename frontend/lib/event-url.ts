/**
 * Canonical public URL for an event (used in share links, OG tags, admin copy-link).
 */
export function getEventPublicUrl(eventId: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  return `${base.replace(/\/$/, "")}/events/${eventId}`
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
