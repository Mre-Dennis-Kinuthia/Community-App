import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { parseMemberSocialLinks } from "@/lib/member-social-links"
import {
  getMembershipTierLabel,
  parseMembershipTier,
} from "@/lib/membership-tier"
import type { MemberConnectionStatus } from "@/types/community"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

function connectionStatusFor(
  viewerId: string | undefined,
  memberId: string,
  row: { fromUserId: string; toUserId: string; status: string } | null
): MemberConnectionStatus {
  if (!viewerId || !row) return "none"
  if (row.status === "accepted") return "connected"
  if (row.status !== "pending") return "none"
  if (row.fromUserId === viewerId) return "pending_sent"
  return "pending_received"
}

/**
 * GET /api/community/[id]
 * Get a single community member's profile
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    const viewerId = session?.user?.id

    const member = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            skills: true,
            location: true,
            industry: true,
            memberType: true,
            membershipTier: true,
            organization: true,
            role: true,
            experienceLevel: true,
            availability: true,
            interests: true,
            socialLinks: true,
            isFeatured: true,
            updatedAt: true,
          },
        },
      },
    })

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    const profile = member.profile
    const isSelf = viewerId === member.id

    let connectionRow: { fromUserId: string; toUserId: string; status: string } | null =
      null
    let viewerConnectionIds: string[] = []

    if (viewerId && !isSelf) {
      connectionRow = await prisma.connection.findFirst({
        where: {
          OR: [
            { fromUserId: viewerId, toUserId: member.id },
            { fromUserId: member.id, toUserId: viewerId },
          ],
        },
        select: { fromUserId: true, toUserId: true, status: true },
      })

      const viewerConnections = await prisma.connection.findMany({
        where: {
          status: "accepted",
          OR: [{ fromUserId: viewerId }, { toUserId: viewerId }],
        },
        select: { fromUserId: true, toUserId: true },
      })
      viewerConnectionIds = viewerConnections.map((c) =>
        c.fromUserId === viewerId ? c.toUserId : c.fromUserId
      )
    }

    const connectionStatus = connectionStatusFor(viewerId, member.id, connectionRow)
    const isConnected = connectionStatus === "connected"

    let isFollowing = false
    if (viewerId && !isSelf) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId,
            followingId: member.id,
          },
        },
      })
      isFollowing = !!follow
    }

    const [connectionCount, followerCount, projects, eventRegistrations] =
      await Promise.all([
        prisma.connection.count({
          where: {
            status: "accepted",
            OR: [{ fromUserId: member.id }, { toUserId: member.id }],
          },
        }),
        prisma.follow.count({
          where: { followingId: member.id },
        }),
        prisma.project.findMany({
          where: {
            founderId: member.id,
            status: "approved",
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
            category: true,
            stage: true,
            imageUrl: true,
          },
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
        prisma.eventRegistration.findMany({
          where: {
            userId: member.id,
            status: { not: "cancelled" },
            event: { deletedAt: null },
          },
          select: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
                location: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ])

    let mutualConnections: {
      id: string
      name: string
      avatar: string | null
      role: string | null
    }[] = []

    if (viewerId && !isSelf && viewerConnectionIds.length > 0) {
      const memberConnections = await prisma.connection.findMany({
        where: {
          status: "accepted",
          OR: [{ fromUserId: member.id }, { toUserId: member.id }],
        },
        select: { fromUserId: true, toUserId: true },
      })
      const memberConnectionIds = new Set(
        memberConnections.map((c) =>
          c.fromUserId === member.id ? c.toUserId : c.fromUserId
        )
      )
      const mutualIds = viewerConnectionIds.filter(
        (uid) => uid !== member.id && memberConnectionIds.has(uid)
      )

      if (mutualIds.length > 0) {
        const mutualUsers = await prisma.user.findMany({
          where: { id: { in: mutualIds.slice(0, 8) } },
          select: {
            id: true,
            name: true,
            image: true,
            profile: { select: { role: true } },
          },
        })
        mutualConnections = mutualUsers.map((u) => ({
          id: u.id,
          name: u.name || "Member",
          avatar: u.image,
          role: u.profile?.role ?? null,
        }))
      }
    }

    const formattedMember = {
      id: member.id,
      name: member.name || "Community member",
      email: isSelf || isConnected ? member.email : "",
      avatar: member.image || null,
      bio: profile?.bio?.trim() || "",
      fullBio: profile?.bio?.trim() || "",
      skills: profile?.skills ?? [],
      location: profile?.location ?? null,
      industry: profile?.industry ?? null,
      role: profile?.role ?? null,
      memberType: profile?.memberType ?? null,
      membershipTier: profile?.membershipTier ?? null,
      membershipLabel: (() => {
        const tier = parseMembershipTier(profile?.membershipTier)
        return tier ? getMembershipTierLabel(tier) : null
      })(),
      organization: profile?.organization ?? null,
      experienceLevel: profile?.experienceLevel ?? null,
      availability: profile?.availability ?? [],
      interests: profile?.interests ?? [],
      socialLinks: parseMemberSocialLinks(profile?.socialLinks),
      connections: connectionCount,
      followers: followerCount,
      projectsInvolved: projects.map((p) => p.id),
      projects,
      recentEvents: eventRegistrations
        .map((r) => r.event)
        .filter(Boolean)
        .map((e) => ({
          id: e.id,
          title: e.title,
          startDate: e.startDate.toISOString(),
          location: e.location,
        })),
      featured: profile?.isFeatured ?? false,
      joinedDate: member.createdAt,
      profileUpdatedAt: profile?.updatedAt?.toISOString() ?? null,
      achievements: [],
      experience: [],
      education: [],
      isConnected,
      connectionStatus,
      isFollowing,
      isSelf,
      mutualConnections,
    }

    return NextResponse.json({ member: formattedMember }, { headers: corsHeaders })
  } catch (error: unknown) {
    console.error("[COMMUNITY API] Error fetching member:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: string }).code)
        : ""

    if (code === "P1001" || message.includes("Can't reach database")) {
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: "Unable to connect to the database.",
        },
        { status: 503, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch member", details: message },
      { status: 500, headers: corsHeaders }
    )
  }
}
