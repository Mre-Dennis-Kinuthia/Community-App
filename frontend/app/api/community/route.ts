import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

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

    // Industry filter (if we add industry to profile)
    if (industry && industry !== "All") {
      // TODO: Add industry field to MemberProfile schema
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

    // Featured filter (if we add featured field)
    if (featured) {
      // TODO: Add featured field to MemberProfile schema
    }

    // Connections filter (if user is logged in)
    if (connectionsOnly && session?.user?.id) {
      // TODO: Implement connections relationship
      // For now, return empty or all members
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
        // TODO: Add connections count when connections are implemented
        orderBy = { createdAt: "desc" }
        break
      case "most_active":
        // TODO: Add activity metrics when implemented
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
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    // Get current user's connections if logged in
    let userConnections: string[] = []
    if (session?.user?.id) {
      // TODO: Fetch connections from database when implemented
      // For now, return empty array
    }

    // Format response
    const formattedMembers = members.map((member) => ({
      id: member.id,
      name: member.name || "Anonymous",
      email: member.email,
      avatar: member.image || null,
      bio: member.profile?.bio || "",
      skills: member.profile?.skills || [],
      location: member.profile?.location || null,
      industry: null, // TODO: Add to schema
      role: null, // TODO: Add to schema
      experienceLevel: null, // TODO: Add to schema
      availability: [], // TODO: Add to schema
      interests: [], // TODO: Add to schema
      connections: 0, // TODO: Calculate from connections
      followers: 0, // TODO: Calculate from followers
      projectsInvolved: [], // TODO: Add relationship
      featured: false, // TODO: Add to schema
      joinedDate: member.createdAt,
      achievements: [], // TODO: Add to schema
      isConnected: userConnections.includes(member.id),
    }))

    // Get unique values for filters (for dropdowns)
    const allMembers = await prisma.user.findMany({
      select: {
        profile: {
          select: {
            skills: true,
            location: true,
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
