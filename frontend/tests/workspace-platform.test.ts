import { describe, expect, it } from "vitest"
import {
  grantMemberAccess,
  revokeMemberAccess,
  syncAccessForBooking,
} from "@/lib/integrations/access-control"
import { CsvAccountingExporter, XeroExporter } from "@/lib/integrations/accounting"

describe("access control (NullAccessProvider)", () => {
  it("grant and revoke are no-ops when accessControl flag is off", async () => {
    await expect(
      grantMemberAccess({ userId: "user_1", locationId: "loc_1" })
    ).resolves.toBeUndefined()
    await expect(
      revokeMemberAccess({ userId: "user_1", bookingId: "bk_1" })
    ).resolves.toBeUndefined()
  })

  it("syncAccessForBooking handles confirmed and cancelled", async () => {
    await expect(
      syncAccessForBooking({
        id: "bk_1",
        userId: "user_1",
        spaceAssetId: "asset_1",
        date: new Date(),
        endTime: "17:00",
        status: "confirmed",
      })
    ).resolves.toBeUndefined()

    await expect(
      syncAccessForBooking({
        id: "bk_1",
        userId: "user_1",
        date: new Date(),
        status: "cancelled",
      })
    ).resolves.toBeUndefined()
  })
})

describe("accounting exporters", () => {
  it("CsvAccountingExporter produces valid CSV", async () => {
    const exporter = new CsvAccountingExporter()
    const csv = await exporter.export([
      {
        date: "2026-06-01",
        type: "invoice",
        reference: "INV-001",
        member: "Jane Doe",
        amount: 5000,
        currency: "KES",
        status: "paid",
      },
    ])
    expect(csv).toContain("INV-001")
    expect(csv).toContain("Jane Doe")
    expect(csv.split("\n").length).toBe(2)
  })

  it("XeroExporter throws until configured", async () => {
    const exporter = new XeroExporter()
    await expect(exporter.export([])).rejects.toThrow(/not configured/i)
  })
})
