import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { countConfirmedRegistrations } from "@/lib/event-registrations"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const { id } = params

    const event = await prisma.event.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

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

    const [confirmedCount, waitlistCount, userRegistration] = await Promise.all([
      countConfirmedRegistrations(prisma, id),
      prisma.eventRegistration.count({
        where: { eventId: id, status: "waitlisted" },
      }),
      session?.user?.email
        ? prisma.eventRegistration.findFirst({
            where: {
              eventId: id,
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
