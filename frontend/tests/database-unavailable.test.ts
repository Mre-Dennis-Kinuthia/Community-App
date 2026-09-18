import { describe, expect, it } from "vitest"
import { isDatabaseUnavailableError } from "@/lib/database-unavailable"

describe("isDatabaseUnavailableError", () => {
  it("detects Neon quota errors", () => {
    expect(
      isDatabaseUnavailableError({
        code: "53000",
        message: "Your account or project has exceeded the quota. Upgrade your plan to increase limits.",
      })
    ).toBe(true)
  })

  it("detects Prisma connection failures", () => {
    expect(
      isDatabaseUnavailableError({
        code: "P1001",
        message: "Can't reach database server",
      })
    ).toBe(true)
  })

  it("detects HTTP 402 from the Neon serverless driver", () => {
    expect(
      isDatabaseUnavailableError(
        new Error('Server error (HTTP status 402): {"message":"Your account or project has exceeded the quota."}')
      )
    ).toBe(true)
  })

  it("does not treat duplicate-email as an outage", () => {
    expect(isDatabaseUnavailableError({ code: "P2002", message: "Unique constraint" })).toBe(
      false
    )
  })
})
