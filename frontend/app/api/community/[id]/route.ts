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
            industry: true,
            role: true,
            experienceLevel: true,
            availability: true,
            interests: true,
            isFeatured: true,
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
      const connections = await prisma.connection.findMany({
        where: {
          OR: [
            { fromUserId: session.user.id, status: "accepted" },
            { toUserId: session.user.id, status: "accepted" },
          ],
        },
        select: {
          fromUserId: true,
          toUserId: true,
        },
      })
      
      connections.forEach((conn) => {
        if (conn.fromUserId === session.user.id) {
          userConnections.push(conn.toUserId)
        } else {
          userConnections.push(conn.fromUserId)
        }
      })
      
      isConnected = userConnections.includes(member.id)
    }

    // Get connection and follower counts
    const [connectionCount, followerCount] = await Promise.all([
      prisma.connection.count({
        where: {
          OR: [
            { fromUserId: member.id, status: "accepted" },
            { toUserId: member.id, status: "accepted" },
          ],
        },
      }),
      prisma.follow.count({
        where: { followingId: member.id },
      }),
    ])

    // Get mutual connections
    let mutualConnections: any[] = []
    if (session?.user?.id && isConnected) {
      const userConnectionsSet = new Set(userConnections)
      const memberConnections = await prisma.connection.findMany({
        where: {
          OR: [
            { fromUserId: member.id, status: "accepted" },
            { toUserId: member.id, status: "accepted" },
          ],
        },
        select: {
          fromUserId: true,
          toUserId: true,
        },
      })
      
      const memberConnectionsSet = new Set(
        memberConnections.map((c) =>
          c.fromUserId === member.id ? c.toUserId : c.fromUserId
        )
      )
      
      const mutual = Array.from(userConnectionsSet).filter((id) =>
        memberConnectionsSet.has(id)
      )
      
      if (mutual.length > 0) {
        const mutualUsers = await prisma.user.findMany({
          where: { id: { in: mutual } },
          select: {
            id: true,
            name: true,
            image: true,
          },
        })
        mutualConnections = mutualUsers
      }
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
      industry: member.profile.industry || null,
      role: member.profile.role || null,
      experienceLevel: member.profile.experienceLevel || null,
      availability: member.profile.availability || [],
      interests: member.profile.interests || [],
      connections: connectionCount,
      followers: followerCount,
      projectsInvolved: [], // Can be added later with Project model
      featured: member.profile.isFeatured || false,
      joinedDate: member.createdAt,
      achievements: [], // Can be added later
      experience: [], // Can be added later
      education: [], // Can be added later
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
