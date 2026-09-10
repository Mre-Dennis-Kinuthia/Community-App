import { redirect } from "next/navigation"
import { NEWS_HUB_NEWSLETTERS_HREF } from "@/lib/news-hub"

export default function NewslettersArchivePage() {
  redirect(NEWS_HUB_NEWSLETTERS_HREF)
}
