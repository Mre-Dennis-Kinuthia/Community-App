import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * Get events (public endpoint)
 * Returns all non-deleted events, ordered by start date
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""

    const skip = (page - 1) * limit
    const now = new Date()

    const where: any = {
      deletedAt: null,
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // Filter by upcoming/past based on startDate
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
          startDate: "asc",
        },
        include: {
          _count: {
            select: {
              registrations: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ])

    return NextResponse.json(
      {
        events,
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
  } catch (error: any) {
    console.error("[EVENTS API] Error fetching events:", error)

    // Check for database connection errors
    if (error?.code === "P1001" || error?.message?.includes("Can't reach database")) {
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
        details: error?.message || "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}
