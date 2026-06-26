import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { createNotification, NotificationTemplates } from "@/lib/notifications"
import { z } from "zod"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const connectionRequestSchema = z.object({
  toUserId: z.string(),
})

/**
 * GET /api/connections
 * Get user's connections
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

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { fromUserId: session.user.id },
          { toUserId: session.user.id },
        ],
      },
    })

    // Get all user IDs involved
    const userIds = new Set<string>()
    connections.forEach((conn) => {
      if (conn.fromUserId !== session.user.id) userIds.add(conn.fromUserId)
      if (conn.toUserId !== session.user.id) userIds.add(conn.toUserId)
    })

    // Fetch user details
    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    const formattedConnections = connections.map((conn) => {
      const otherUserId =
        conn.fromUserId === session.user.id ? conn.toUserId : conn.fromUserId
      const otherUser = userMap.get(otherUserId)
      
      return {
        id: conn.id,
        userId: otherUserId,
        name: otherUser?.name || "Unknown",
        email: otherUser?.email || "",
        avatar: otherUser?.image || null,
        status: conn.status,
        createdAt: conn.createdAt,
      }
    })

    return NextResponse.json(
      { connections: formattedConnections },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[CONNECTIONS API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500, headers: corsHeaders }
    )
  }
}

/**
 * POST /api/connections
 * Send connection request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const { toUserId } = connectionRequestSchema.parse(body)

    if (toUserId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot connect to yourself" },
        { status: 400, headers: corsHeaders }
      )
    }

    const recipient = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true },
    })

    if (!recipient) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    // Check if connection already exists
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { fromUserId: session.user.id, toUserId },
          { fromUserId: toUserId, toUserId: session.user.id },
        ],
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Connection request already exists" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Create connection request
    const connection = await prisma.connection.create({
      data: {
        fromUserId: session.user.id,
        toUserId,
        status: "pending",
      },
    })

    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    })
    const senderLabel =
      sender?.name?.trim() || sender?.email?.split("@")[0] || "A community member"

    await createNotification({
      userId: toUserId,
      ...NotificationTemplates.connectionRequest(
        session.user.id,
        senderLabel,
        connection.id
      ),
    })

    return NextResponse.json(
      { message: "Connection request sent", connection },
      { status: 201, headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[CONNECTIONS API] Error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { error: "Failed to send connection request" },
      { status: 500, headers: corsHeaders }
    )
  }
}
