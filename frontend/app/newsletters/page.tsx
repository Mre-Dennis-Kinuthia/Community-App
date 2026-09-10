import { redirect } from "next/navigation"
import { NEWS_HUB_PATH } from "@/lib/news-hub"

export default function NewslettersArchivePage() {
  redirect(NEWS_HUB_PATH)
}
