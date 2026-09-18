import { describe, expect, it } from "vitest"
import {
  isScheduledMaintenance,
  MAINTENANCE_UNTIL_ISO,
  shouldBypassMaintenance,
} from "@/lib/maintenance"

describe("scheduled maintenance", () => {
  it("is on before Monday 5PM EAT", () => {
    expect(isScheduledMaintenance(Date.parse("2026-09-21T16:59:00+03:00"))).toBe(true)
  })

  it("is off after Monday 5PM EAT", () => {
    expect(isScheduledMaintenance(Date.parse("2026-09-21T17:00:01+03:00"))).toBe(false)
  })

  it("lets the maintenance page and APIs through", () => {
    expect(shouldBypassMaintenance("/maintenance")).toBe(true)
    expect(shouldBypassMaintenance("/register")).toBe(true)
    expect(shouldBypassMaintenance("/api/health")).toBe(true)
    expect(shouldBypassMaintenance("/login")).toBe(false)
  })

  it("uses the Monday 5PM EAT cutoff", () => {
    expect(MAINTENANCE_UNTIL_ISO).toBe("2026-09-21T17:00:00+03:00")
  })
})
