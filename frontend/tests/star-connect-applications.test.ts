import { describe, expect, it } from "vitest"
import {
  getStarConnectApplication,
  parseStarConnectApplicationId,
  starConnectApplyPath,
  workspaceNeedForOption,
} from "@/lib/star-connect-applications"

describe("Star Connect application plans", () => {
  it("maps aliases onto Monthly, Flex, Virtual, and Team", () => {
    expect(parseStarConnectApplicationId("monthly")).toBe("community-monthly")
    expect(parseStarConnectApplicationId("five-day-pack")).toBe("flex")
    expect(parseStarConnectApplicationId("virtual")).toBe("virtual-office")
    expect(parseStarConnectApplicationId("team")).toBe("team-community")
    expect(parseStarConnectApplicationId("unknown")).toBe("community-monthly")
  })

  it("customizes copy and options per plan", () => {
    const monthly = getStarConnectApplication("community-monthly")
    const flex = getStarConnectApplication("flex")
    const virtual = getStarConnectApplication("virtual-office")
    const team = getStarConnectApplication("team-community")

    expect(monthly.requiresTeamSize).toBe(false)
    expect(flex.workspaceNeeds.some((item) => item.includes("Five-Day Pack"))).toBe(true)
    expect(virtual.productName).toMatch(/virtual office/i)
    expect(team.requiresTeamSize).toBe(true)
    expect(team.primaryNeeds).not.toEqual(monthly.primaryNeeds)
  })

  it("builds apply URLs and preselects Flex packs", () => {
    expect(starConnectApplyPath("flex", "ten-day-pack")).toBe(
      "/membership/star-connect?plan=flex&option=ten-day-pack"
    )
    expect(workspaceNeedForOption("five-day-pack")).toMatch(/Five-Day Pack/)
  })
})
