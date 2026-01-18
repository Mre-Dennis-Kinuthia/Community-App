import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/app/api/admin/middleware"
import { corsHeaders, handleOptions } from "@/middleware-cors"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * Get dashboard metrics for admin
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const { error, admin } = await requireAdmin(request)
    if (error) return error

    // Get counts
    const [totalMembers, activeProjects, upcomingEvents, totalBookings, recentBookings] = await Promise.all([
      prisma.user.count(),
      prisma.project.count({
        where: { deletedAt: null },
      }),
      prisma.event.count({
        where: {
          startDate: { gte: new Date() },
          deletedAt: null,
        },
      }),
      prisma.workspaceBooking.count({
        where: {
          status: { not: "cancelled" },
        },
      }),
      prisma.workspaceBooking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { status: { not: "cancelled" } },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ])

    // Calculate revenue (this month)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const revenueResult = await prisma.workspaceBooking.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: { not: "cancelled" },
        paymentStatus: "paid",
      },
      _sum: {
        totalPrice: true,
      },
    })

    const revenue = revenueResult._sum.totalPrice || 0

    return NextResponse.json(
      {
        metrics: {
          totalMembers,
          activeProjects,
          upcomingEvents,
          totalBookings,
          revenue: {
            amount: revenue,
            currency: "KES",
            period: "this_month",
          },
        },
        recentBookings: recentBookings.map((booking) => ({
          id: booking.id,
          resourceType: booking.resourceType,
          date: booking.date,
          startTime: booking.startTime,
          duration: booking.duration,
          totalPrice: booking.totalPrice,
          status: booking.status,
          user: booking.user,
          createdAt: booking.createdAt,
        })),
      },
      {
        headers: corsHeaders(request),
      }
    )
  } catch (error) {
    console.error("[ADMIN DASHBOARD] Error fetching metrics:", error)
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { 
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}
