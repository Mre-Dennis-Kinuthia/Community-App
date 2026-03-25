import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function resolveUserIdFromSession(session: Awaited<ReturnType<typeof auth>>) {
  const sessionUser = session?.user
  if (!sessionUser) return null

  // Best-effort: try by id first (in case the DB already has this user).
  if (typeof sessionUser.id === "string") {
    const existing = await prisma.user.findUnique({ where: { id: sessionUser.id } })
    if (existing) return existing.id
  }

  // Fallback: upsert by email (so we satisfy workspace_bookings.userId FK).
  const email = typeof sessionUser.email === "string" ? sessionUser.email.toLowerCase().trim() : null
  if (!email) return null

  const upserted = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: typeof sessionUser.name === "string" ? sessionUser.name : null,
      image: typeof (sessionUser as any).image === "string" ? (sessionUser as any).image : null,
    },
    update: {
      name: typeof sessionUser.name === "string" ? sessionUser.name : undefined,
      image: typeof (sessionUser as any).image === "string" ? (sessionUser as any).image : undefined,
    },
  })

  return upserted.id
}

/**
 * Get upcoming bookings for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = await resolveUserIdFromSession(session)
    if (!userId) {
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
        userId,
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
