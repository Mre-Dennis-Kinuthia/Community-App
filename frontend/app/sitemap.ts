import type { MetadataRoute } from "next"
import {
  getAppBaseUrl,
  PRIVACY_POLICY_PATH,
  TERMS_OF_SERVICE_PATH,
} from "@/lib/app-url"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppBaseUrl()
  const lastModified = new Date()

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}${PRIVACY_POLICY_PATH}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${base}${TERMS_OF_SERVICE_PATH}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ]
}
