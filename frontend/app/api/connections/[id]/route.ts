import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { z } from "zod"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const updateConnectionSchema = z.object({
  status: z.enum(["accepted", "rejected", "blocked"]),
})

/**
 * PUT /api/connections/[id]
 * Accept/reject connection request
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
        { status: 401, headers: corsHeaders }
      )
    }

    const { id: connectionId } = params
    const body = await request.json()
    const { status } = updateConnectionSchema.parse(body)

    // Get connection
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    })

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    // Verify user is the recipient
    if (connection.toUserId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403, headers: corsHeaders }
      )
    }

    // Update connection status
    const updated = await prisma.connection.update({
      where: { id: connectionId },
      data: { status },
    })

    return NextResponse.json(
      { message: "Connection updated", connection: updated },
      { headers: corsHeaders }
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
      { error: "Failed to update connection" },
      { status: 500, headers: corsHeaders }
    )
  }
}

/**
 * DELETE /api/connections/[id]
 * Remove connection
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
        { status: 401, headers: corsHeaders }
      )
    }

    const { id: connectionId } = params

    // Get connection
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    })

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    // Verify user is part of the connection
    if (
      connection.fromUserId !== session.user.id &&
      connection.toUserId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403, headers: corsHeaders }
      )
    }

    // Delete connection
    await prisma.connection.delete({
      where: { id: connectionId },
    })

    return NextResponse.json(
      { message: "Connection removed" },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[CONNECTIONS API] Error:", error)
    return NextResponse.json(
      { error: "Failed to remove connection" },
      { status: 500, headers: corsHeaders }
    )
  }
}
