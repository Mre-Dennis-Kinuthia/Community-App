import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET endpoint to list all users (for debugging - remove in production!)
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // Don't return password hash
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log("[USERS API] Found users:", users.length)

    return NextResponse.json({
      count: users.length,
      users,
    })
  } catch (error) {
    console.error("[USERS API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
