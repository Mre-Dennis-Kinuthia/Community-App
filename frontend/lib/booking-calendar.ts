import {
  buildIcsInviteContent,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  type EventCalendarInput,
} from "@/lib/event-calendar"
import { getDashboardBookingUrl } from "@/lib/app-url"
import { formatBookingAddOnsPlainText } from "@/lib/booking-add-ons"
import { formatResourceType } from "@/lib/booking-format"

export const BOOKING_TIMEZONE = "Africa/Nairobi"
export const BOOKING_VENUE_LOCATION = "Impact Hub Nairobi"

export interface BookingCalendarInput {
  id: string
  resourceType: string
  date: Date | string
  startTime: string
  endTime?: string | null
  addOns?: string[]
  addOnsPrice?: number
  pastriesPax?: number
}

export interface BookingCalendarLinks {
  google: string
  outlook: string
  icsPath: string
}

function calendarDayInZone(date: Date | string, timeZone: string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d)
}

function parseTimeHm(time: string): { hours: number; minutes: number } | null {
  const match = time.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return { hours, minutes }
}

/** Nairobi is UTC+3 year-round (no DST). */
export function bookingInstantInNairobi(date: Date | string, time: string): Date | null {
  const ymd = calendarDayInZone(date, BOOKING_TIMEZONE)
  const hm = parseTimeHm(time)
  if (!hm) return null
  const [year, month, day] = ymd.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day, hm.hours - 3, hm.minutes, 0))
}

export function getBookingStartEnd(input: BookingCalendarInput): {
  start: Date
  end: Date
} | null {
  const start = bookingInstantInNairobi(input.date, input.startTime)
  if (!start) return null

  if (input.endTime) {
    const end = bookingInstantInNairobi(input.date, input.endTime)
    if (end && end > start) return { start, end }
  }

  return { start, end: new Date(start.getTime() + 60 * 60 * 1000) }
}

function toEventCalendarInput(booking: BookingCalendarInput): EventCalendarInput | null {
  const range = getBookingStartEnd(booking)
  if (!range) return null

  const resource = formatResourceType(booking.resourceType)
  const bookingUrl = getDashboardBookingUrl(booking.id)
  const addOnsText = formatBookingAddOnsPlainText({
    addOnIds: booking.addOns ?? [],
    addOnsPrice: booking.addOnsPrice,
    pastriesPax: booking.pastriesPax,
  })

  const description = [
    `${resource} booking at Impact Hub Nairobi.`,
    addOnsText !== "None" ? `Add-ons:\n${addOnsText}` : null,
    `Booking details: ${bookingUrl}`,
  ]
    .filter(Boolean)
    .join("\n\n")

  return {
    id: booking.id,
    title: `${resource} — Impact Hub Nairobi`,
    description,
    startDate: range.start,
    endDate: range.end,
    timezone: BOOKING_TIMEZONE,
    location: BOOKING_VENUE_LOCATION,
  }
}

export function buildBookingIcsInviteContent(
  booking: BookingCalendarInput,
  options?: {
    attendeeEmail?: string | null
    attendeeName?: string | null
  }
): string | null {
  const event = toEventCalendarInput(booking)
  if (!event) return null
  return buildIcsInviteContent(event, options)
}

export function icsFilenameForBooking(resourceType: string): string {
  const slug = formatResourceType(resourceType)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `${slug || "booking"}.ics`
}

export function getBookingCalendarLinks(booking: BookingCalendarInput): BookingCalendarLinks | null {
  const event = toEventCalendarInput(booking)
  if (!event) return null
  return {
    google: getGoogleCalendarUrl(event),
    outlook: getOutlookCalendarUrl(event),
    icsPath: `/api/bookings/${booking.id}/calendar.ics`,
  }
}

export function buildBookingCalendarInvite(booking: BookingCalendarInput, options?: {
  attendeeEmail?: string | null
  attendeeName?: string | null
}): { content: string; filename: string } | null {
  const content = buildBookingIcsInviteContent(booking, options)
  if (!content) return null
  return {
    content,
    filename: icsFilenameForBooking(booking.resourceType),
  }
}
