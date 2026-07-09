import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/landing/events
 * Public upcoming events for the marketing landing page.
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get("limit") || "6", 10),
      12
    )

    const events = await prisma.event.findMany({
      where: {
        deletedAt: null,
        visibility: "public",
        startDate: { gte: now },
      },
      orderBy: [{ featuredOnHomepage: "desc" }, { startDate: "asc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        location: true,
        eventType: true,
        imageUrl: true,
        price: true,
        currency: true,
        featuredOnHomepage: true,
        slug: true,
        shortCode: true,
      },
    })

    return NextResponse.json(
      {
        events: events.map((event) => ({
          id: event.id,
          title: event.title,
          startDate: event.startDate.toISOString(),
          endDate: event.endDate?.toISOString() ?? null,
          location: event.location,
          eventType: event.eventType,
          imageUrl: event.imageUrl,
          price: event.price,
          currency: event.currency,
          slug: event.slug,
          shortCode: event.shortCode,
          featuredOnHomepage: event.featuredOnHomepage,
        })),
      },
      { headers: corsHeaders(request) }
    )
  } catch (error) {
    console.error("[LANDING EVENTS]", error)
    return NextResponse.json({ events: [] }, { headers: corsHeaders(request) })
  }
}
