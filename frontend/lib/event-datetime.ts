/** Default when event.timezone is unset (Impact Hub Nairobi). */
export const DEFAULT_EVENT_TIMEZONE = "Africa/Nairobi"

function toDate(value: Date | string): Date {
  return typeof value === "string" ? new Date(value) : value
}

export function getTimezoneOffsetMinutes(timeZone: string, date: Date): number {
  const utc = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }))
  const zoned = new Date(date.toLocaleString("en-US", { timeZone }))
  return (zoned.getTime() - utc.getTime()) / 60_000
}

export function eventFormPartsToUtc(
  date: string,
  time: string,
  timeZone: string
): Date {
  const [year, month, day] = date.split("-").map(Number)
  const [hour, minute] = (time || "00:00").split(":").map(Number)
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0)
  const offsetMin = getTimezoneOffsetMinutes(timeZone, new Date(utcGuess))
  return new Date(utcGuess - offsetMin * 60_000)
}

function zonedParts(utcDate: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
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
  }
}

export function utcToEventFormParts(
  utcDate: Date | string,
  timeZone: string
): { date: string; time: string } {
  const d = toDate(utcDate)
  const p = zonedParts(d, timeZone)
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    time: `${p.hour}:${p.minute}`,
  }
}

export function formatEventDate(
  utcDate: Date | string,
  timeZone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(toDate(utcDate))
}

export function formatEventTime(
  utcDate: Date | string,
  timeZone: string
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(toDate(utcDate))
}

export function formatEventTime24(
  utcDate: Date | string,
  timeZone: string
): string {
  const p = zonedParts(toDate(utcDate), timeZone)
  return `${p.hour}:${p.minute}`
}

export function formatEventDateShort(
  utcDate: Date | string,
  timeZone: string
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(toDate(utcDate))
}

export function formatEventDateTimeLine(
  utcDate: Date | string,
  timeZone: string
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(toDate(utcDate))
}

export function eventTimezone(timezone?: string | null): string {
  return timezone?.trim() || DEFAULT_EVENT_TIMEZONE
}

/** Calendar date at midnight in event TZ (for isToday / timeline grouping). */
export function eventCalendarDate(
  utcDate: Date | string,
  timeZone: string
): Date {
  const { date } = utcToEventFormParts(utcDate, timeZone)
  const [y, m, d] = date.split("-").map(Number)
  return new Date(y, m - 1, d)
}
