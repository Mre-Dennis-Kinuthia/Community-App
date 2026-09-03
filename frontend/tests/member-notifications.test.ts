import { describe, expect, it } from "vitest"
import {
  STAFF_ALERT_CATEGORY,
  canMemberAccessNotification,
} from "@/lib/notifications"

describe("member notification visibility", () => {
  const memberId = "member-1"

  it("allows personal and member broadcast notifications", () => {
    expect(
      canMemberAccessNotification({ userId: memberId, category: "booking" }, memberId)
    ).toBe(true)
    expect(
      canMemberAccessNotification({ userId: null, category: "opportunity" }, memberId)
    ).toBe(true)
  })

  it("blocks staff alerts and other users' notifications", () => {
    expect(
      canMemberAccessNotification(
        { userId: null, category: STAFF_ALERT_CATEGORY },
        memberId
      )
    ).toBe(false)
    expect(
      canMemberAccessNotification({ userId: "other-member", category: "booking" }, memberId)
    ).toBe(false)
  })
})
