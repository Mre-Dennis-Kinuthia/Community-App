import { eventTimezone } from "@/lib/event-datetime"
import { getEventPublicUrl } from "@/lib/event-url"
import { displayLocation } from "@/lib/event-constants"

export interface EventCalendarInput {
  id: string
  title: string
  description?: string | null
  startDate: Date | string
  endDate?: Date | string | null
  timezone?: string | null
  location?: string | null
  locationType?: string | null
  onlineUrl?: string | null
  slug?: string | null
  shortCode?: string | null
}

export interface EventCalendarLinks {
  google: string
  outlook: string
  icsPath: string
}

function toDate(value: Date | string): Date {
  return typeof value === "string" ? new Date(value) : value
}

function zonedParts(utcDate: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(utcDate)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ""

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  }
}

function formatCalendarLocalDate(utcDate: Date, timeZone: string): string {
  const p = zonedParts(utcDate, timeZone)
  return `${p.year}${p.month}${p.day}T${p.hour}${p.minute}${p.second}`
}

function defaultEndDate(start: Date, end?: Date | null): Date {
  if (end && end > start) return end
  return new Date(start.getTime() + 2 * 60 * 60 * 1000)
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
}

function formatIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")
}

export function buildEventCalendarDetails(event: EventCalendarInput): {
  title: string
  location: string
  description: string
  timeZone: string
  start: Date
  end: Date
  eventUrl: string
} {
  const timeZone = eventTimezone(event.timezone)
  const start = toDate(event.startDate)
  const end = defaultEndDate(start, event.endDate ? toDate(event.endDate) : null)
  const eventUrl = getEventPublicUrl(event)
  const location = displayLocation(event)
  const description = [
    event.description?.trim(),
    event.onlineUrl?.trim() ? `Join online: ${event.onlineUrl.trim()}` : null,
    `Event page: ${eventUrl}`,
  ]
    .filter(Boolean)
    .join("\n\n")

  return {
    title: event.title,
    location,
    description,
    timeZone,
    start,
    end,
    eventUrl,
  }
}

export function getGoogleCalendarUrl(event: EventCalendarInput): string {
  const { title, location, description, timeZone, start, end } =
    buildEventCalendarDetails(event)
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatCalendarLocalDate(start, timeZone)}/${formatCalendarLocalDate(end, timeZone)}`,
    details: description,
    location,
    ctz: timeZone,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function getOutlookCalendarUrl(event: EventCalendarInput): string {
  const { title, location, description, start, end } = buildEventCalendarDetails(event)
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: description,
    location,
  })
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

export function buildIcsContent(event: EventCalendarInput): string {
  const { title, location, description, timeZone, start, end, eventUrl } =
    buildEventCalendarDetails(event)
  const uid = `event-${event.id}@impact-hub-nairobi`
  const now = formatIcsUtc(new Date())
  const dtStart = formatCalendarLocalDate(start, timeZone).replace(
    /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
    "$1$2$3T$4$5$6"
  )
  const dtEnd = formatCalendarLocalDate(end, timeZone).replace(
    /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
    "$1$2$3T$4$5$6"
  )

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Impact Hub Nairobi//Community Platform//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=${timeZone}:${dtStart}`,
    `DTEND;TZID=${timeZone}:${dtEnd}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `URL:${eventUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}

export function getEventCalendarLinks(
  event: EventCalendarInput,
  publicEventId?: string
): EventCalendarLinks {
  const id = publicEventId ?? event.id
  return {
    google: getGoogleCalendarUrl(event),
    outlook: getOutlookCalendarUrl(event),
    icsPath: `/api/events/${id}/calendar.ics`,
  }
}
