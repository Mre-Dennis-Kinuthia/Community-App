import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { getEventPublicUrl, getEventShareText } from "@/lib/event-url"

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params

  try {
    const event = await prisma.event.findFirst({
      where: { id, deletedAt: null },
      select: {
        title: true,
        description: true,
        imageUrl: true,
        startDate: true,
        visibility: true,
      },
    })

    if (!event) {
      return { title: "Event not found | Impact Hub Nairobi" }
    }

    const url = getEventPublicUrl(id)
    const description =
      event.description?.replace(/\s+/g, " ").trim().slice(0, 160) ||
      getEventShareText(event.title, event.startDate)

    return {
      title: `${event.title} | Impact Hub Nairobi`,
      description,
      openGraph: {
        title: event.title,
        description,
        url,
        type: "website",
        siteName: "Impact Hub Nairobi",
        ...(event.imageUrl ? { images: [{ url: event.imageUrl, alt: event.title }] } : {}),
      },
      twitter: {
        card: event.imageUrl ? "summary_large_image" : "summary",
        title: event.title,
        description,
        ...(event.imageUrl ? { images: [event.imageUrl] } : {}),
      },
      alternates: { canonical: url },
    }
  } catch {
    return { title: "Event | Impact Hub Nairobi" }
  }
}

export default function EventDetailLayout({ children }: LayoutProps) {
  return children
}
