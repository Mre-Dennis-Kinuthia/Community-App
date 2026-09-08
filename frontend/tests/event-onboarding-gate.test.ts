import { describe, expect, it } from "vitest"
import { eventAllowsJoinWithoutOnboarding } from "@/lib/event-onboarding-gate"

describe("eventAllowsJoinWithoutOnboarding", () => {
  it("defaults to allowing join when the flag is missing", () => {
    expect(eventAllowsJoinWithoutOnboarding({})).toBe(true)
    expect(eventAllowsJoinWithoutOnboarding({ allowJoinWithoutOnboarding: null })).toBe(true)
    expect(eventAllowsJoinWithoutOnboarding({ allowJoinWithoutOnboarding: undefined })).toBe(true)
  })

  it("can be turned off in event settings", () => {
    expect(eventAllowsJoinWithoutOnboarding({ allowJoinWithoutOnboarding: false })).toBe(false)
  })

  it("stays on when staff leave the setting enabled", () => {
    expect(eventAllowsJoinWithoutOnboarding({ allowJoinWithoutOnboarding: true })).toBe(true)
  })
})
