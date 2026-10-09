import { describe, expect, it } from "vitest"
import {
  bookingAccessAction,
  hikvisionEmployeeNo,
  planGrantExistingCard,
  planIssueCard,
  planRevokeCards,
} from "@/lib/integrations/access-policy"

describe("access outbox planning", () => {
  it("derives a short employee number", () => {
    expect(hikvisionEmployeeNo("user", "clk9abcxyz123").startsWith("U")).toBe(true)
  })

  it("admin confirm of a free booking grants; unpaid paid-desk booking waits", () => {
    expect(
      bookingAccessAction({ status: "confirmed", paymentStatus: "pending", totalPrice: 0 })
    ).toBe("grant")
    expect(
      bookingAccessAction({ status: "confirmed", paymentStatus: "pending", totalPrice: 1500 })
    ).toBe("none")
  })

  it("does not enqueue jobs without a live card", () => {
    expect(planGrantExistingCard({ credentials: [] }).kind).toBe("skip")
  })

  it("enqueues upsert then grant for an existing badge", () => {
    const plan = planGrantExistingCard({
      credentials: [
        {
          id: "cred_1",
          userId: "user_1",
          visitorId: null,
          cardNo: "1001",
          employeeNo: "Uuser1",
          status: "active",
        },
      ],
    })
    expect(plan.kind).toBe("update")
    if (plan.kind === "update") {
      expect(plan.jobs).toHaveLength(2)
    }
  })

  it("revoke plans a revoke_card job", () => {
    const plan = planRevokeCards([
      {
        id: "cred_1",
        userId: "user_1",
        visitorId: null,
        cardNo: "1001",
        employeeNo: "Uuser1",
        status: "active",
      },
    ])
    expect(plan.jobs[0].action).toBe("revoke_card")
  })

  it("issue card replaces the previous live badge", () => {
    const plan = planIssueCard({
      userId: "user_1",
      cardNo: "2002",
      existing: [
        {
          id: "old",
          userId: "user_1",
          visitorId: null,
          cardNo: "1001",
          employeeNo: "Uuser1",
          status: "pending",
        },
      ],
    })
    expect(plan.revokeIds).toEqual(["old"])
  })
})
