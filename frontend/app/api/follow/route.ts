import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { createNotification, NotificationTemplates } from "@/lib/notifications"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"
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
    const viewerId = await resolveUserIdFromSession(session)
    if (!viewerId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const { followingId } = followSchema.parse(body)

    if (followingId === viewerId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400, headers: corsHeaders }
      )
    }

    const target = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true },
    })

    if (!target) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: viewerId,
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
        followerId: viewerId,
        followingId,
      },
    })

    const follower = await prisma.user.findUnique({
      where: { id: viewerId },
      select: { name: true, email: true },
    })
    const followerLabel =
      follower?.name?.trim() || follower?.email?.split("@")[0] || "A community member"

    await createNotification({
      userId: followingId,
      skipEmail: true,
      ...NotificationTemplates.memberFollowed(viewerId, followerLabel, follow.id),
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
    const viewerId = await resolveUserIdFromSession(session)
    if (!viewerId) {
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
          followerId: viewerId,
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
