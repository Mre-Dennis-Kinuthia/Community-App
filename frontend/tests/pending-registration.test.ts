import { describe, expect, it } from "vitest"
import {
  buildPendingRegistration,
  mergePendingRegistrationFile,
} from "@/lib/pending-registration"

describe("pending registration JSON", () => {
  it("captures name, email, and intent without a password", () => {
    const row = buildPendingRegistration({
      email: "Ada@ImpactHub.net",
      firstName: "Ada",
      lastName: "Wanjiku",
      organisational: false,
      submittedAt: new Date("2026-09-18T16:00:00.000Z"),
    })

    expect(row).toMatchObject({
      email: "ada@impacthub.net",
      firstName: "Ada",
      lastName: "Wanjiku",
      name: "Ada Wanjiku",
      membershipIntent: "community",
      acceptedTerms: true,
      source: "register",
    })
    expect(row).not.toHaveProperty("password")
  })

  it("replaces an earlier signup from the same email", () => {
    const first = buildPendingRegistration({
      email: "ada@impacthub.net",
      name: "Ada",
      submittedAt: new Date("2026-09-18T16:00:00.000Z"),
    })
    const second = buildPendingRegistration({
      email: "ada@impacthub.net",
      name: "Ada Wanjiku",
      submittedAt: new Date("2026-09-18T17:00:00.000Z"),
    })
    const merged = mergePendingRegistrationFile({ updatedAt: first.submittedAt, signups: [first] }, second)
    expect(merged.signups).toHaveLength(1)
    expect(merged.signups[0]?.name).toBe("Ada Wanjiku")
  })
})
