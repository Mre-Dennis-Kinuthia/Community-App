/** Member-facing hub that combines news articles and newsletter editions. */
export const NEWS_HUB_PATH = "/news"
export const NEWS_HUB_NEWSLETTERS_HREF = "/news?categoryId=newsletter"
export const NEWS_HUB_LABEL = "News & Updates"
export const NEWSLETTER_CATEGORY_ID = "newsletter"

export const NEWSLETTER_CATEGORY = {
  id: NEWSLETTER_CATEGORY_ID,
  name: "Newsletter",
  slug: "newsletter",
  color: "#822929",
} as const

export function isNewsHubPath(pathname: string): boolean {
  return (
    pathname === NEWS_HUB_PATH ||
    pathname.startsWith(`${NEWS_HUB_PATH}/`) ||
    pathname === "/newsletters" ||
    pathname.startsWith("/newsletters/")
  )
}
