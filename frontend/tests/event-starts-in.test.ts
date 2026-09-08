import { afterEach, describe, expect, it, vi } from "vitest"
import { formatEventStartsIn } from "@/lib/event-datetime"

describe("formatEventStartsIn", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns a compact countdown before the event", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-09T00:00:00.000Z"))
    expect(formatEventStartsIn("2026-09-25T12:00:00.000Z")).toBe("Starting in 16d 12h")
  })

  it("returns null once the event has started", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-25T13:00:00.000Z"))
    expect(formatEventStartsIn("2026-09-25T12:00:00.000Z")).toBeNull()
  })
})
