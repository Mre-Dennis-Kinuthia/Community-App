import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { createNotification, NotificationTemplates } from "@/lib/notifications"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"
import { z } from "zod"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const updateConnectionSchema = z.object({
  status: z.enum(["accepted", "rejected", "blocked"]),
})

async function requireUserId() {
  const session = await auth()
  const userId = await resolveUserIdFromSession(session)
  if (!userId) return null
  return userId
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
    }

    const { id: connectionId } = await params
    const body = await request.json()
    const { status } = updateConnectionSchema.parse(body)

    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    })

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404, headers: corsHeaders })
    }

    if (connection.toUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403, headers: corsHeaders })
    }

    if (connection.status !== "pending") {
      return NextResponse.json(
        { error: "This connection request has already been handled" },
        { status: 409, headers: corsHeaders }
      )
    }

    const updated = await prisma.connection.update({
      where: { id: connectionId },
      data: { status },
    })

    if (status === "accepted") {
      const accepter = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      })
      const accepterLabel =
        accepter?.name?.trim() || accepter?.email?.split("@")[0] || "A community member"

      await createNotification({
        userId: connection.fromUserId,
        skipEmail: true,
        ...NotificationTemplates.connectionAccepted(userId, accepterLabel, connectionId),
      })
    }

    return NextResponse.json(
      { message: "Connection updated", connection: updated },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error("[CONNECTIONS API PUT]", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { error: "Failed to update connection" },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
    }

    const { id: connectionId } = await params

    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    })

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404, headers: corsHeaders })
    }

    if (connection.fromUserId !== userId && connection.toUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403, headers: corsHeaders })
    }

    await prisma.connection.delete({
      where: { id: connectionId },
    })

    return NextResponse.json({ message: "Connection removed" }, { headers: corsHeaders })
  } catch (error) {
    console.error("[CONNECTIONS API DELETE]", error)
    return NextResponse.json(
      { error: "Failed to remove connection" },
      { status: 500, headers: corsHeaders }
    )
  }
}
