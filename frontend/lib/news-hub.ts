/** Member-facing hub that combines news articles and newsletter editions. */
export const NEWS_HUB_PATH = "/news"
export const NEWS_HUB_NEWSLETTERS_HREF = "/news?tab=newsletters"
export const NEWS_HUB_LABEL = "News & Updates"

export function isNewsHubPath(pathname: string): boolean {
  return (
    pathname === NEWS_HUB_PATH ||
    pathname.startsWith(`${NEWS_HUB_PATH}/`) ||
    pathname === "/newsletters" ||
    pathname.startsWith("/newsletters/")
  )
}
