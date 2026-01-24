import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      )
    }

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0)

    // Get upcoming events count for this week
    const upcomingEventsCount = await prisma.event.count({
      where: {
        startDate: {
          gte: now,
          lte: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000), // End of week
        },
        deletedAt: null,
      },
    })

    // Get total active members (users with profiles)
    const activeMembersCount = await prisma.user.count({
      where: {
        profile: {
          isNot: null,
        },
      },
    })

    // Get user's connection count
    const userConnectionsCount = await prisma.connection.count({
      where: {
        OR: [
          { fromUserId: session.user.id, status: "accepted" },
          { toUserId: session.user.id, status: "accepted" },
        ],
      },
    })

    // Get user's event registrations count
    const userEventsCount = await prisma.eventRegistration.count({
      where: {
        userId: session.user.id,
        status: { not: "cancelled" },
      },
    })

    return NextResponse.json(
      {
        upcomingEvents: upcomingEventsCount,
        activeMembers: activeMembersCount,
        userConnections: userConnectionsCount,
        userEvents: userEventsCount,
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[DASHBOARD STATS API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500, headers: corsHeaders }
    )
  }
}
