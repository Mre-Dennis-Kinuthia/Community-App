import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { findEventByPublicParam, ensureEventSlugAndShortCode } from "@/lib/event-slug"

type PageProps = {
  params: Promise<{ code: string }>
}

/**
 * Short share links: /e/{shortCode} → canonical /events/{slug}
 */
export default async function ShortEventLinkPage({ params }: PageProps) {
  const { code } = await params
  const event = await findEventByPublicParam(prisma, code)

  if (!event) {
    notFound()
  }

  const { slug } = await ensureEventSlugAndShortCode(prisma, event)
  redirect(`/events/${slug}`)
}
