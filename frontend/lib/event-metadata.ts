import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { findEventByPublicParam, ensureEventSlugAndShortCode } from "@/lib/event-slug"
import {
  getEventOpenGraphImageUrl,
  getEventPublicUrl,
  getEventShareText,
} from "@/lib/event-url"
import { eventOgAlt } from "@/lib/event-opengraph"
import { richTextToPlainText } from "@/lib/rich-text"

export async function buildEventShareMetadata(param: string): Promise<Metadata> {
  try {
    let event = await findEventByPublicParam(prisma, param)
    if (!event) {
      return { title: "Event not found | Impact Hub Nairobi" }
    }

    const links = await ensureEventSlugAndShortCode(prisma, event)
    event = { ...event, ...links }

    const url = getEventPublicUrl(event)
    const ogImageUrl = getEventOpenGraphImageUrl(event)
    const description =
      richTextToPlainText(event.description, 160) ||
      getEventShareText(event.title, event.startDate)

    return {
      title: event.title,
      description,
      openGraph: {
        title: event.title,
        description,
        url,
        type: "website",
        siteName: "Impact Hub Nairobi",
        locale: "en_KE",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: event.title || eventOgAlt,
            type: "image/png",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: event.title,
        description,
        images: [ogImageUrl],
      },
      alternates: { canonical: url },
    }
  } catch {
    return { title: "Event | Impact Hub Nairobi" }
  }
}
