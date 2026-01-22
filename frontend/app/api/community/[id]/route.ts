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
          },
        },
      },
    })

    if (!member || !member.profile) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    // Get user's connections if logged in
    let userConnections: string[] = []
    let isConnected = false
    if (session?.user?.id) {
      // TODO: Fetch connections from database when implemented
      isConnected = userConnections.includes(member.id)
    }

    // Get mutual connections
    let mutualConnections: any[] = []
    if (session?.user?.id && isConnected) {
      // TODO: Calculate mutual connections when implemented
    }

    // Format response
    const formattedMember = {
      id: member.id,
      name: member.name || "Anonymous",
      email: member.email,
      avatar: member.image || null,
      bio: member.profile.bio || "",
      fullBio: member.profile.bio || "",
      skills: member.profile.skills || [],
      location: member.profile.location || null,
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
      experience: [], // TODO: Add to schema
      education: [], // TODO: Add to schema
      isConnected,
      mutualConnections,
    }

    return NextResponse.json({ member: formattedMember }, { headers: corsHeaders })
  } catch (error: any) {
    console.error("[COMMUNITY API] Error fetching member:", error)

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
        error: "Failed to fetch member",
        details: error?.message || "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    )
  }
}
