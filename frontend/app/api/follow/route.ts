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

const followSchema = z.object({
  followingId: z.string(),
})

/**
 * POST /api/follow
 * Follow a user
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
    const { followingId } = followSchema.parse(body)

    if (followingId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId,
      },
    })

    return NextResponse.json(
      { message: "Successfully followed user", follow },
      { status: 201, headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[FOLLOW API] Error:", error)

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
      { error: "Failed to follow user" },
      { status: 500, headers: corsHeaders }
    )
  }
}

/**
 * DELETE /api/follow?followingId=xxx
 * Unfollow a user
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const followingId = searchParams.get("followingId")

    if (!followingId) {
      return NextResponse.json(
        { error: "followingId is required" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    })

    return NextResponse.json(
      { message: "Successfully unfollowed user" },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[FOLLOW API] Error:", error)
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500, headers: corsHeaders }
    )
  }
}
