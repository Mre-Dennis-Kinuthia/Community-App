/** Scheduled platform maintenance while Neon is restored. */

export const MAINTENANCE_UNTIL_ISO = "2026-09-21T17:00:00+03:00"

export const MAINTENANCE_UNTIL_LABEL = "Monday, 21 September 2026 at 5:00 PM EAT"

export const MAINTENANCE_PATH = "/maintenance"

export function isScheduledMaintenance(now = Date.now()): boolean {
  const flag = process.env.MAINTENANCE_MODE?.trim().toLowerCase()
  if (flag === "off" || flag === "false" || flag === "0") return false
  if (flag === "on" || flag === "true" || flag === "1") return true
  return now < Date.parse(MAINTENANCE_UNTIL_ISO)
}

const MAINTENANCE_PASSTHROUGH = [
  "/",
  "/maintenance",
  "/register",
  "/programs",
  "/pricing",
  "/privacy",
  "/terms",
]

export function shouldBypassMaintenance(pathname: string): boolean {
  if (pathname.startsWith("/api")) return true
  return MAINTENANCE_PASSTHROUGH.some((path) => {
    if (path === "/") return pathname === "/"
    return pathname === path || pathname.startsWith(`${path}/`)
  })
}
