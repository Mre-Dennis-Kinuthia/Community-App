import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  countConfirmedRegistrations,
  getRegistrationCountsByEventIds,
} from "@/lib/event-registrations"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

function enrichEventsWithCounts<T extends { id: string }>(
  events: T[],
  counts: Map<string, { confirmed: number; waitlisted: number }>
) {
  return events.map((event) => {
    const c = counts.get(event.id) ?? { confirmed: 0, waitlisted: 0 }
    return {
      ...event,
      confirmedCount: c.confirmed,
      waitlistCount: c.waitlisted,
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const eventType = searchParams.get("eventType") || searchParams.get("type") || ""

    const skip = (page - 1) * limit
    const now = new Date()

    const where: Record<string, unknown> = {
      deletedAt: null,
    }

    if (session?.user) {
      where.visibility = { in: ["public", "members"] }
    } else {
      where.visibility = "public"
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { organizerName: { contains: search, mode: "insensitive" } },
      ]
    }

    if (eventType && eventType !== "all") {
      where.eventType = eventType
    }

    const filter = searchParams.get("filter") || "all"
    if (filter === "upcoming") {
      where.startDate = { gte: now }
    } else if (filter === "past") {
      where.startDate = { lt: now }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          startDate: filter === "past" ? "desc" : "asc",
        },
      }),
      prisma.event.count({ where }),
    ])

    const counts = await getRegistrationCountsByEventIds(
      prisma,
      events.map((e) => e.id)
    )

    let eventsWithCounts = enrichEventsWithCounts(events, counts)

    if (session?.user?.email) {
      const email = session.user.email.toLowerCase().trim()
      const userRegs = await prisma.eventRegistration.findMany({
        where: {
          eventId: { in: events.map((e) => e.id) },
          email,
          status: { in: ["registered", "waitlisted", "attended"] },
        },
        select: { eventId: true, status: true },
      })
      const regMap = new Map(userRegs.map((r) => [r.eventId, r.status]))
      eventsWithCounts = eventsWithCounts.map((event) => ({
        ...event,
        userRegistrationStatus: regMap.get(event.id) ?? null,
      }))
    }

    return NextResponse.json(
      {
        events: eventsWithCounts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: corsHeaders(request),
      }
    )
  } catch (error: unknown) {
    console.error("[EVENTS API] Error fetching events:", error)

    const err = error as { code?: string; message?: string }
    if (err?.code === "P1001" || err?.message?.includes("Can't reach database")) {
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: "Unable to connect to the database.",
        },
        {
          status: 503,
          headers: corsHeaders(request),
        }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to fetch events",
        details: err?.message || "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}
