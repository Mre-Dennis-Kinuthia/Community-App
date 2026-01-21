import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/notifications/[id]
 * Get a single notification
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    // Ensure user can only access their own notifications.
    // Broadcast notifications (userId: null) are visible to all users.
    if (notification.userId && notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json({ notification })
  } catch (error: any) {
    console.error("[NOTIFICATIONS API] Error fetching notification:", error)
    
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
        error: "Failed to fetch notification",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/notifications/[id]
 * Update a notification (mark as read, etc.)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { read, ...otherUpdates } = body

    // First, verify the notification exists and belongs to the user
    const existing = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    // Allow user to update their own notifications.
    // Broadcast notifications (userId: null) can be updated by any user,
    // which will effectively mark them read for everyone.
    if (existing.userId && existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const updateData: any = { ...otherUpdates }
    
    if (read !== undefined) {
      updateData.read = read
      if (read && !existing.read) {
        updateData.readAt = new Date()
      } else if (!read) {
        updateData.readAt = null
      }
    }

    const notification = await prisma.notification.update({
      where: { id: params.id },
      data: updateData,
    })

    console.log("[NOTIFICATIONS API] Notification updated:", notification.id)

    return NextResponse.json({ notification })
  } catch (error: any) {
    console.error("[NOTIFICATIONS API] Error updating notification:", error)

    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

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
        error: "Failed to update notification",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications/[id]
 * Soft delete a notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify the notification exists and belongs to the user
    const existing = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    // Allow user to delete their own notifications.
    // Broadcast notifications (userId: null) can be deleted by any user,
    // which removes them for everyone.
    if (existing.userId && existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Soft delete
    const notification = await prisma.notification.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
      },
    })

    console.log("[NOTIFICATIONS API] Notification deleted:", notification.id)

    return NextResponse.json({ message: "Notification deleted successfully" })
  } catch (error: any) {
    console.error("[NOTIFICATIONS API] Error deleting notification:", error)
    
    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

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
        error: "Failed to delete notification",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    )
  }
}
