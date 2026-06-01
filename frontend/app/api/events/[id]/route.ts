import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { countConfirmedRegistrations } from "@/lib/event-registrations"
import { findEventByPublicParam, ensureEventSlugAndShortCode } from "@/lib/event-slug"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth()
    const { id: param } = await Promise.resolve(params)

    let event = await findEventByPublicParam(prisma, param)

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

    const links = await ensureEventSlugAndShortCode(prisma, event)
    event = { ...event, ...links }

    if (!session?.user) {
      if (event.visibility === "members") {
        return NextResponse.json(
          { error: "This event is for members only. Please log in to view it." },
          { status: 403, headers: corsHeaders(request) }
        )
      }
      if (event.visibility === "private") {
        return NextResponse.json(
          { error: "This is a private event. Please log in with an invited account." },
          { status: 403, headers: corsHeaders(request) }
        )
      }
    }

    const eventId = event.id

    const [confirmedCount, waitlistCount, userRegistration] = await Promise.all([
      countConfirmedRegistrations(prisma, eventId),
      prisma.eventRegistration.count({
        where: { eventId, status: "waitlisted" },
      }),
      session?.user?.email
        ? prisma.eventRegistration.findFirst({
            where: {
              eventId,
              email: session.user.email.toLowerCase().trim(),
              status: { in: ["registered", "waitlisted", "attended"] },
            },
            select: { id: true, status: true, createdAt: true },
          })
        : Promise.resolve(null),
    ])

    return NextResponse.json(
      {
        event: {
          ...event,
          confirmedCount,
          waitlistCount,
        },
        userRegistration,
      },
      { headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    console.error("[EVENTS API] Error fetching event by id:", error)
    const err = error as { message?: string }
    return NextResponse.json(
      {
        error: "Failed to fetch event",
        details: err?.message || "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}
