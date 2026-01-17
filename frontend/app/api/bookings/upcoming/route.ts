import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * Get upcoming bookings for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "5")
    const days = parseInt(searchParams.get("days") || "7")

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + days)

    const bookings = await prisma.workspaceBooking.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: "cancelled",
        },
      },
      orderBy: {
        date: "asc",
      },
      take: limit,
      select: {
        id: true,
        resourceType: true,
        date: true,
        startTime: true,
        endTime: true,
        duration: true,
        status: true,
        totalPrice: true,
      },
    })

    return NextResponse.json({ bookings }, { status: 200 })
  } catch (error) {
    console.error("[BOOKINGS UPCOMING API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch upcoming bookings" },
      { status: 500 }
    )
  }
}
