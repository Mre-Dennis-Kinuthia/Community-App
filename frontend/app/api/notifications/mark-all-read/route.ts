import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/notifications/mark-all-read
 * Mark all user's notifications as read
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
        deletedAt: null,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })

    console.log("[NOTIFICATIONS API] Marked", result.count, "notifications as read")

    return NextResponse.json({ 
      message: "All notifications marked as read",
      count: result.count,
    })
  } catch (error: any) {
    console.error("[NOTIFICATIONS API] Error marking notifications as read:", error)
    
    if (error?.code === "P1001" || error?.message?.includes("Can't reach database")) {
      return NextResponse.json(
        { 
          error: "Database connection failed",
          details: "Unable to connect to the database."
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { 
        error: "Failed to mark notifications as read",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    )
  }
}
