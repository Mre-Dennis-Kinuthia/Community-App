export const HUB_TIMEZONE = "Africa/Nairobi"

/** Calendar date in hub timezone as YYYY-MM-DD. */
export function hubDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: HUB_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

/** Start/end of a calendar day in Nairobi (UTC+3, no DST). */
export function hubDayBounds(date: Date = new Date()) {
  const dateStr = hubDateString(date)
  return {
    dateStr,
    start: new Date(`${dateStr}T00:00:00+03:00`),
    end: new Date(`${dateStr}T23:59:59.999+03:00`),
  }
}

export function formatHubDateTime(value: Date | string): string {
  return new Date(value).toLocaleString("en-KE", {
    timeZone: HUB_TIMEZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}
