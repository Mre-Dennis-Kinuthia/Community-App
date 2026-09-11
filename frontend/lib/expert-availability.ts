import { z } from "zod"

export const EIR_TIMEZONE = "Africa/Nairobi"
export const EIR_UTC_OFFSET_HOURS = 3
export const EXPERT_BOOKING_HORIZON_DAYS = 14
export const EXPERT_SESSION_DURATIONS = [30, 45, 60] as const
export type ExpertSessionDuration = (typeof EXPERT_SESSION_DURATIONS)[number]

export const EXPERT_WEEKDAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
] as const

export type ExpertAvailabilityWindowInput = {
  weekday: number
  startTime: string
  endTime: string
}

export type BookableSlot = {
  start: string
  end: string
}

const TIME_HM = /^([01]\d|2[0-3]):[0-5]\d$/

function normalizeHm(value: unknown) {
  if (typeof value !== "string") return value
  const match = value.trim().match(/^(\d{1,2}):([0-5]\d)/)
  if (!match) return value
  return `${String(Number(match[1])).padStart(2, "0")}:${match[2]}`
}

export const availabilityWindowSchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    startTime: z.preprocess(normalizeHm, z.string().regex(TIME_HM, "Use 24-hour time (09:00)")),
    endTime: z.preprocess(normalizeHm, z.string().regex(TIME_HM, "Use 24-hour time (12:00)")),
  })
  .refine((row) => hmToMinutes(row.startTime) < hmToMinutes(row.endTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  })

export const expertAvailabilityUpdateSchema = z.object({
  industries: z.array(z.string()).optional(),
  websiteUrl: z.string().trim().max(2000).nullable().optional(),
  sessionDurationMinutes: z.number().int().refine(
    (value): value is ExpertSessionDuration =>
      (EXPERT_SESSION_DURATIONS as readonly number[]).includes(value),
    "Choose 30, 45, or 60 minutes"
  ).optional(),
  availabilityEnabled: z.boolean().optional(),
  availabilityWindows: z.array(availabilityWindowSchema).max(21).optional(),
})

export function hmToMinutes(hm: string) {
  const [hours, minutes] = hm.split(":").map(Number)
  return hours * 60 + minutes
}

export function minutesToHm(total: number) {
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export function weekdayLabel(weekday: number) {
  return EXPERT_WEEKDAYS.find((day) => day.value === weekday)?.label ?? "Day"
}

export function nairobiParts(date: Date) {
  const shifted = new Date(date.getTime() + EIR_UTC_OFFSET_HOURS * 60 * 60 * 1000)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    weekday: shifted.getUTCDay(),
  }
}

export function nairobiWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
) {
  return new Date(Date.UTC(year, month - 1, day, hour - EIR_UTC_OFFSET_HOURS, minute))
}

export function addNairobiDays(
  year: number,
  month: number,
  day: number,
  days: number
) {
  const utc = Date.UTC(year, month - 1, day + days)
  const next = new Date(utc)
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
    weekday: next.getUTCDay(),
  }
}

export function formatNairobiSlot(iso: string) {
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: EIR_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function formatNairobiRange(startIso: string, endIso: string) {
  const start = new Intl.DateTimeFormat("en-KE", {
    timeZone: EIR_TIMEZONE,
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(startIso))
  const end = new Intl.DateTimeFormat("en-KE", {
    timeZone: EIR_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(endIso))
  return `${start} – ${end} EAT`
}

function overlaps(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
) {
  return startA < endB && endA > startB
}

export function generateBookableSlots(options: {
  windows: ExpertAvailabilityWindowInput[]
  durationMinutes: number
  booked: Array<{ start: Date; end: Date }>
  from?: Date
  days?: number
}): BookableSlot[] {
  const from = options.from ?? new Date()
  const days = options.days ?? EXPERT_BOOKING_HORIZON_DAYS
  const duration = options.durationMinutes
  if (!Number.isFinite(duration) || duration < 15) return []

  const origin = nairobiParts(from)
  const slots: BookableSlot[] = []

  for (let offset = 0; offset < days; offset += 1) {
    const day = addNairobiDays(origin.year, origin.month, origin.day, offset)
    const windows = options.windows.filter((window) => window.weekday === day.weekday)
    for (const window of windows) {
      let cursor = hmToMinutes(window.startTime)
      const end = hmToMinutes(window.endTime)
      while (cursor + duration <= end) {
        const startHm = minutesToHm(cursor)
        const endHm = minutesToHm(cursor + duration)
        const [startH, startM] = startHm.split(":").map(Number)
        const [endH, endM] = endHm.split(":").map(Number)
        const start = nairobiWallTimeToUtc(day.year, day.month, day.day, startH, startM)
        const finish = nairobiWallTimeToUtc(day.year, day.month, day.day, endH, endM)
        const isFuture = start.getTime() - from.getTime() >= 30 * 60 * 1000
        const taken = options.booked.some((row) => overlaps(start, finish, row.start, row.end))
        if (isFuture && !taken) {
          slots.push({ start: start.toISOString(), end: finish.toISOString() })
        }
        cursor += duration
      }
    }
  }

  return slots
}

export function findMatchingSlot(
  slots: BookableSlot[],
  scheduledAt: string
) {
  const target = new Date(scheduledAt).getTime()
  if (!Number.isFinite(target)) return null
  return slots.find((slot) => new Date(slot.start).getTime() === target) ?? null
}
