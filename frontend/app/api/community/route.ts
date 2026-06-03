import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { parseMemberSocialLinks } from "@/lib/member-social-links"
import {
  getMembershipTierLabel,
  parseMembershipTier,
} from "@/lib/membership-tier"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/community
 * Get community members with filtering, pagination, and search
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100) // Max 100 per page
    const search = searchParams.get("search") || ""
    const industry = searchParams.get("industry")
    const role = searchParams.get("role")
    const experience = searchParams.get("experience")
    const location = searchParams.get("location")
    const skills = searchParams.get("skills")?.split(",").filter(Boolean) || []
    const sortBy = searchParams.get("sort") || "newest"
    const featured = searchParams.get("featured") === "true"
    const connectionsOnly = searchParams.get("connectionsOnly") === "true"

    const skip = (page - 1) * limit
    const session = await auth()
    const viewerId = await resolveUserIdFromSession(session)

    // Build where clause
    // Show all users - profiles are optional
    const where: any = {}

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { profile: { bio: { contains: search, mode: "insensitive" } } },
        { profile: { skills: { hasSome: [search] } } },
      ]
    }

    // Industry filter
    if (industry && industry !== "All") {
      where.profile = {
        ...where.profile,
        industry: { equals: industry, mode: "insensitive" },
      }
    }

    // Role filter
    if (role && role !== "All") {
      where.profile = {
        ...where.profile,
        role: { equals: role, mode: "insensitive" },
      }
    }

    // Experience filter
    if (experience && experience !== "All") {
      where.profile = {
        ...where.profile,
        experienceLevel: { equals: experience, mode: "insensitive" },
      }
    }

    // Skills filter
    if (skills.length > 0) {
      where.profile = {
        ...where.profile,
        skills: { hasSome: skills },
      }
    }

    // Location filter
    if (location && location !== "All") {
      where.profile = {
        ...where.profile,
        location: { contains: location, mode: "insensitive" },
      }
    }

    // Featured filter
    if (featured) {
      where.profile = {
        ...where.profile,
        isFeatured: true,
      }
    }

    // Connections filter (if user is logged in)
    if (connectionsOnly && viewerId) {
      // Get user's accepted connections
      const userConnections = await prisma.connection.findMany({
        where: {
          OR: [
            { fromUserId: viewerId, status: "accepted" },
            { toUserId: viewerId, status: "accepted" },
          ],
        },
        select: {
          fromUserId: true,
          toUserId: true,
        },
      })
      
      const connectedUserIds = new Set<string>()
      userConnections.forEach((conn) => {
        if (conn.fromUserId === viewerId) {
          connectedUserIds.add(conn.toUserId)
        } else {
          connectedUserIds.add(conn.fromUserId)
        }
      })
      
      if (connectedUserIds.size > 0) {
        where.id = { in: Array.from(connectedUserIds) }
      } else {
        // No connections, return empty result
        where.id = { in: [] }
      }
    }

    // Build orderBy
    let orderBy: any = {}
    switch (sortBy) {
      case "newest":
        orderBy = { createdAt: "desc" }
        break
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "alphabetical":
        orderBy = { name: "asc" }
        break
      case "most_connected":
        // Sort by connection count (will be calculated in response)
        orderBy = { createdAt: "desc" }
        break
      case "most_active":
        // Sort by recent activity (createdAt for now, can add activity tracking later)
        orderBy = { createdAt: "desc" }
        break
      default:
        orderBy = { createdAt: "desc" }
    }

    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
            role: true,
            memberType: true,
            membershipTier: true,
            organization: true,
            experienceLevel: true,
              availability: true,
              interests: true,
              socialLinks: true,
              isFeatured: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    // Get current user's connections if logged in
    let userConnections: string[] = []
    if (viewerId) {
      const connections = await prisma.connection.findMany({
        where: {
          OR: [
            { fromUserId: viewerId, status: "accepted" },
            { toUserId: viewerId, status: "accepted" },
          ],
        },
        select: {
          fromUserId: true,
          toUserId: true,
        },
      })
      
      connections.forEach((conn) => {
        if (conn.fromUserId === viewerId) {
          userConnections.push(conn.toUserId)
        } else {
          userConnections.push(conn.fromUserId)
        }
      })
    }

    // Get connection and follower counts for all members
    const memberIds = members.map((m) => m.id)
    const [connectionCounts, followerCounts] = await Promise.all([
      prisma.connection.groupBy({
        by: ["fromUserId"],
        where: {
          fromUserId: { in: memberIds },
          status: "accepted",
        },
        _count: true,
      }),
      prisma.follow.groupBy({
        by: ["followingId"],
        where: {
          followingId: { in: memberIds },
        },
        _count: true,
      }),
    ])

    const connectionCountMap = new Map(
      connectionCounts.map((c) => [c.fromUserId, c._count])
    )
    const followerCountMap = new Map(
      followerCounts.map((f) => [f.followingId, f._count])
    )

    // Format response
    const formattedMembers = members.map((member) => {
      const connections = connectionCountMap.get(member.id) || 0
      const followers = followerCountMap.get(member.id) || 0
      
      const isSelf = viewerId === member.id
      const isConnected = userConnections.includes(member.id)
      const canSeeEmail = isSelf || isConnected

      return {
        id: member.id,
        name: member.name || "Anonymous",
        email: canSeeEmail ? member.email : "",
        avatar: member.image || null,
        bio: member.profile?.bio || "",
        skills: member.profile?.skills || [],
        location: member.profile?.location || null,
        industry: member.profile?.industry || null,
        role: member.profile?.role || null,
        memberType: member.profile?.memberType || null,
        membershipTier: member.profile?.membershipTier || null,
        membershipLabel: (() => {
          const tier = parseMembershipTier(member.profile?.membershipTier)
          return tier ? getMembershipTierLabel(tier) : null
        })(),
        organization: member.profile?.organization || null,
        experienceLevel: member.profile?.experienceLevel || null,
        availability: member.profile?.availability || [],
        interests: member.profile?.interests || [],
        socialLinks: parseMemberSocialLinks(member.profile?.socialLinks),
        connections,
        followers,
        projectsInvolved: [], // Can be added later with Project model
        featured: member.profile?.isFeatured || false,
        joinedDate: member.createdAt,
        achievements: [], // Can be added later
        isConnected,
        isSelf,
      }
    })

    // Sort by most connected if needed
    if (sortBy === "most_connected") {
      formattedMembers.sort((a, b) => b.connections - a.connections)
    }

    // Get unique values for filters (for dropdowns)
    const allMembers = await prisma.user.findMany({
      select: {
        profile: {
          select: {
            skills: true,
            location: true,
            industry: true,
            role: true,
          },
        },
      },
    })

    const allSkills = Array.from(
      new Set(allMembers.flatMap((m) => m.profile?.skills || []))
    )
    const allLocations = Array.from(
      new Set(
        allMembers
          .map((m) => m.profile?.location)
          .filter((loc): loc is string => Boolean(loc))
      )
    )
    const allIndustries = Array.from(
      new Set(
        allMembers
          .map((m) => m.profile?.industry)
          .filter((ind): ind is string => Boolean(ind))
      )
    )
    const allRoles = Array.from(
      new Set(
        allMembers
          .map((m) => m.profile?.role)
          .filter((r): r is string => Boolean(r))
      )
    )

    return NextResponse.json(
      {
        members: formattedMembers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          skills: allSkills,
          locations: allLocations,
          industries: allIndustries,
          roles: allRoles,
        },
        userConnections,
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[COMMUNITY API] Error fetching members:", error)

    if (error?.code === "P1001" || error?.message?.includes("Can't reach database")) {
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: "Unable to connect to the database.",
        },
        { status: 503, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to fetch community members",
        details: error?.message || "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
