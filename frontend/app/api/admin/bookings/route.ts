import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "../middleware"
import { corsHeaders, handleOptions } from "@/middleware-cors"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/admin/bookings - List all bookings (admin view)
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const { error, admin } = await requireAdmin(request)
    if (error) return error
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status")
    const date = searchParams.get("date")

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (date) {
      const dateObj = new Date(date)
      const startOfDay = new Date(dateObj)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(dateObj)
      endOfDay.setHours(23, 59, 59, 999)
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }

    const [bookings, total] = await Promise.all([
      prisma.workspaceBooking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "asc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.workspaceBooking.count({ where }),
    ])

    return NextResponse.json(
      {
        bookings,
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
  } catch (error) {
    console.error("[ADMIN BOOKINGS] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { 
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}
