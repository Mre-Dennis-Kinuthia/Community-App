import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { findEventByPublicParam, ensureEventSlugAndShortCode } from "@/lib/event-slug"
import { buildEventShareMetadata } from "@/lib/event-metadata"
import EventDetailPage from "@/app/events/[id]/page"

type PageProps = {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params
  return buildEventShareMetadata(code)
}

/**
 * Short share links stay on /e/{code} so crawlers (WhatsApp, Slack, LinkedIn)
 * get Open Graph title, description, and image instead of an empty redirect.
 */
export default async function ShortEventLinkPage({ params }: PageProps) {
  const { code } = await params
  const event = await findEventByPublicParam(prisma, code)

  if (!event) {
    notFound()
  }

  const { slug } = await ensureEventSlugAndShortCode(prisma, event)
  return <EventDetailPage params={Promise.resolve({ id: slug || event.id })} />
}
