import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET endpoint to list all users for community directory
 * Returns users with their profiles for public display
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    const where: any = {}

    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        {
          profile: {
            OR: [
              { bio: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
          profile: {
            select: {
              bio: true,
              skills: true,
              location: true,
            },
          },
          // Don't return password hash
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: corsHeaders(request),
      }
    )
  } catch (error) {
    console.error("[USERS API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      {
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}
