/**
 * Calendar helpers for booking / availability — avoid `toISOString().split("T")[0]`
 * which uses UTC and can shift the calendar day for members in positive UTC offsets.
 */

export function formatLocalYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Start/end of a `YYYY-MM-DD` calendar day in the server (or runtime) local timezone. */
export function parseLocalCalendarDay(dateStr: string): { start: Date; end: Date } | null {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const yy = Number(m[1])
  const mm = Number(m[2])
  const dd = Number(m[3])
  if (!Number.isFinite(yy) || !Number.isFinite(mm) || !Number.isFinite(dd)) return null
  const start = new Date(yy, mm - 1, dd, 0, 0, 0, 0)
  const end = new Date(yy, mm - 1, dd, 23, 59, 59, 999)
  return { start, end }
}

/** Stable instant for the chosen calendar day (noon local) for APIs expecting an ISO datetime. */
export function localCalendarDayToISO(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0).toISOString()
}
