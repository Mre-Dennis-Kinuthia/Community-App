import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { createNotification, NotificationTemplates } from "@/lib/notifications"
import { getAppBaseUrl } from "@/lib/app-url"
import {
  isEmailConfigured,
  sendConnectionRequestEmail,
  sendEmailInBackground,
} from "@/lib/email"
import { findConnectionBetween } from "@/lib/connection-requests"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"
import { z } from "zod"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const connectionRequestSchema = z.object({
  toUserId: z.string().min(1),
})

async function requireUserId() {
  const session = await auth()
  const userId = await resolveUserIdFromSession(session)
  if (!userId) return null
  return { userId, session }
}

export async function GET() {
  try {
    const authResult = await requireUserId()
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
    }

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { fromUserId: authResult.userId },
          { toUserId: authResult.userId },
        ],
      },
    })

    const userIds = new Set<string>()
    connections.forEach((conn) => {
      if (conn.fromUserId !== authResult.userId) userIds.add(conn.fromUserId)
      if (conn.toUserId !== authResult.userId) userIds.add(conn.toUserId)
    })

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, name: true, email: true, image: true },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    const formattedConnections = connections.map((conn) => {
      const otherUserId =
        conn.fromUserId === authResult.userId ? conn.toUserId : conn.fromUserId
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

    return NextResponse.json({ connections: formattedConnections }, { headers: corsHeaders })
  } catch (error) {
    console.error("[CONNECTIONS API GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireUserId()
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
    }

    const { userId } = authResult
    const body = await request.json()
    const { toUserId } = connectionRequestSchema.parse(body)

    if (toUserId === userId) {
      return NextResponse.json(
        { error: "Cannot connect to yourself" },
        { status: 400, headers: corsHeaders }
      )
    }

    const recipient = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true, email: true, name: true },
    })

    if (!recipient) {
      return NextResponse.json({ error: "Member not found" }, { status: 404, headers: corsHeaders })
    }

    const existing = await findConnectionBetween(userId, toUserId)

    if (existing) {
      if (existing.status === "accepted") {
        return NextResponse.json(
          { message: "Already connected", connection: existing, alreadyConnected: true },
          { headers: corsHeaders }
        )
      }

      if (existing.status === "pending") {
        if (existing.fromUserId === userId) {
          return NextResponse.json(
            { message: "Connection request already sent", connection: existing, alreadySent: true },
            { headers: corsHeaders }
          )
        }

        return NextResponse.json(
          {
            error: "This member already sent you a connection request. Open their profile to respond.",
            code: "pending_received",
            connection: existing,
          },
          { status: 409, headers: corsHeaders }
        )
      }

      if (existing.status === "blocked") {
        return NextResponse.json(
          { error: "Unable to send a connection request to this member." },
          { status: 403, headers: corsHeaders }
        )
      }

      await prisma.connection.delete({ where: { id: existing.id } })
    }

    const connection = await prisma.connection.create({
      data: {
        fromUserId: userId,
        toUserId,
        status: "pending",
      },
    })

    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    })
    const senderLabel =
      sender?.name?.trim() || sender?.email?.split("@")[0] || "A community member"
    const profileUrl = `${getAppBaseUrl()}/community/${userId}`

    await createNotification({
      userId: toUserId,
      skipEmail: true,
      ...NotificationTemplates.connectionRequest(userId, senderLabel, connection.id),
    })

    if (isEmailConfigured() && recipient.email) {
      sendEmailInBackground(
        () =>
          sendConnectionRequestEmail({
            to: recipient.email,
            name: recipient.name,
            fromName: senderLabel,
            profileUrl,
          }),
        `connection-request:${recipient.email}`
      )
    } else if (!isEmailConfigured()) {
      console.error("[CONNECTIONS API] Email not configured — connection request email skipped")
    }

    return NextResponse.json(
      { message: "Connection request sent", connection },
      { status: 201, headers: corsHeaders }
    )
  } catch (error) {
    console.error("[CONNECTIONS API POST]", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { error: "Failed to send connection request" },
      { status: 500, headers: corsHeaders }
    )
  }
}
