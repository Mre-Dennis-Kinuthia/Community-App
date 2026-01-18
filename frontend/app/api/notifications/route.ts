import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createNotificationSchema = z.object({
  userId: z.string().optional().nullable(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(["info", "success", "warning", "error"]).default("info"),
  category: z.string().optional().nullable(),
  actionUrl: z.string().url().optional().nullable(),
  relatedId: z.string().optional().nullable(),
  relatedType: z.string().optional().nullable(),
})

/**
 * GET /api/notifications
 * Get user's notifications
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

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const category = searchParams.get("category")

    const skip = (page - 1) * limit

    // Include both user-specific and broadcast (userId: null) notifications
    const where: any = {
      OR: [
        { userId: session.user.id },
        { userId: null }, // Broadcast notifications for all users
      ],
      deletedAt: null,
    }

    if (unreadOnly) {
      where.read = false
    }

    if (category) {
      where.category = category
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          OR: [
            { userId: session.user.id },
            { userId: null }, // Broadcast notifications
          ],
          read: false,
          deletedAt: null,
        },
      }),
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    })
  } catch (error: any) {
    console.error("[NOTIFICATIONS API] Error fetching notifications:", error)
    
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
        error: "Failed to fetch notifications",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications
 * Create a notification (admin/system use)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    // Only allow authenticated users to create notifications
    // In production, you might want to restrict this to admins
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log("[NOTIFICATIONS API] Creating notification:", body)

    const validatedData = createNotificationSchema.parse(body)

    // If userId is not provided, use the current user's ID
    const userId = validatedData.userId || session.user.id

    const notification = await prisma.notification.create({
      data: {
        ...validatedData,
        userId,
      },
    })

    console.log("[NOTIFICATIONS API] Notification created:", notification.id)

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error: any) {
    console.error("[NOTIFICATIONS API] Error creating notification:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
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
        error: "Failed to create notification",
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    )
  }
}
