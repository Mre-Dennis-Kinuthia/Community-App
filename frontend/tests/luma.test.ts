import { describe, expect, it } from "vitest"
import { safeLumaRedirectUrl } from "@/lib/luma"

describe("safeLumaRedirectUrl", () => {
  it("accepts HTTPS Luma registration links", () => {
    expect(safeLumaRedirectUrl("https://lu.ma/event/evt-example")).toBe(
      "https://lu.ma/event/evt-example"
    )
    expect(safeLumaRedirectUrl("https://events.luma.com/my-event")).toBe(
      "https://events.luma.com/my-event"
    )
  })

  it("rejects non-Luma and non-HTTPS destinations", () => {
    expect(safeLumaRedirectUrl("https://example.com/event")).toBeNull()
    expect(safeLumaRedirectUrl("http://lu.ma/event/evt-example")).toBeNull()
    expect(safeLumaRedirectUrl("//lu.ma/event/evt-example")).toBeNull()
    expect(safeLumaRedirectUrl(null)).toBeNull()
  })
})
