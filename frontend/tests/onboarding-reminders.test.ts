import { describe, expect, it } from "vitest"
import {
  ONBOARDING_REMINDER_SCHEDULE_DAYS,
  getNextOnboardingReminderDue,
  isOnboardingReminderDue,
  shouldShowOnboardingNudge,
} from "@/lib/onboarding-reminders"

describe("onboarding reminder schedule", () => {
  const signup = new Date("2026-01-01T10:00:00.000Z")

  it("defines reminders on days 2, 5, 10, and 14", () => {
    expect(ONBOARDING_REMINDER_SCHEDULE_DAYS).toEqual([2, 5, 10, 14])
  })

  it("computes due dates from signup and reminder count", () => {
    expect(getNextOnboardingReminderDue(signup, 0)?.toISOString()).toBe(
      "2026-01-03T10:00:00.000Z"
    )
    expect(getNextOnboardingReminderDue(signup, 1)?.toISOString()).toBe(
      "2026-01-06T10:00:00.000Z"
    )
    expect(getNextOnboardingReminderDue(signup, 4)).toBeNull()
  })

  it("only marks reminders due after the scheduled day", () => {
    expect(
      isOnboardingReminderDue(signup, 0, new Date("2026-01-02T23:59:59.000Z"))
    ).toBe(false)
    expect(
      isOnboardingReminderDue(signup, 0, new Date("2026-01-03T10:00:00.000Z"))
    ).toBe(true)
    expect(
      isOnboardingReminderDue(signup, 1, new Date("2026-01-05T23:59:59.000Z"))
    ).toBe(false)
    expect(
      isOnboardingReminderDue(signup, 1, new Date("2026-01-06T10:00:00.000Z"))
    ).toBe(true)
  })

  it("shows in-app nudge after the first reminder is due", () => {
    expect(shouldShowOnboardingNudge(signup)).toBe(true)
    const recentSignup = new Date(Date.now() - 24 * 60 * 60 * 1000)
    expect(shouldShowOnboardingNudge(recentSignup)).toBe(false)
  })
})
