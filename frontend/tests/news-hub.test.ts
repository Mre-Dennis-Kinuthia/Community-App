import { describe, expect, it } from "vitest"
import { isNewsHubPath, NEWS_HUB_NEWSLETTERS_HREF, NEWS_HUB_PATH } from "@/lib/news-hub"
import { isNavPathActive } from "@/lib/nav-config"

describe("News & updates hub", () => {
  it("treats articles and newsletter editions as one nav section", () => {
    expect(isNewsHubPath("/news")).toBe(true)
    expect(isNewsHubPath("/news/some-story")).toBe(true)
    expect(isNewsHubPath("/newsletters")).toBe(true)
    expect(isNewsHubPath("/newsletters/june-edition")).toBe(true)
    expect(isNewsHubPath("/events")).toBe(false)

    expect(isNavPathActive("/newsletters/june", NEWS_HUB_PATH)).toBe(true)
    expect(NEWS_HUB_NEWSLETTERS_HREF).toBe("/news?categoryId=newsletter")
  })
})
