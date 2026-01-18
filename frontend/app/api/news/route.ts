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
 * Get published news posts (public endpoint)
 * Only returns posts with status "published" and publishedAt in the past
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit
    const now = new Date()

    const where: any = {
      deletedAt: null,
      status: "published",
      OR: [
        { publishedAt: null }, // Allow posts without publishedAt if status is published
        { publishedAt: { lte: now } }, // Only show posts published in the past
      ],
    }

    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.newsPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          publishedAt: "desc",
        },
        select: {
          id: true,
          title: true,
          content: true,
          excerpt: true,
          imageUrl: true,
          publishedAt: true,
          createdAt: true,
        },
      }),
      prisma.newsPost.count({ where }),
    ])

    return NextResponse.json(
      {
        posts,
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
  } catch (error: any) {
    console.error("[NEWS API] Error fetching news posts:", error)

    // Check for database connection errors
    if (error?.code === "P1001" || error?.message?.includes("Can't reach database")) {
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: "Unable to connect to the database.",
        },
        {
          status: 503,
          headers: corsHeaders(request),
        }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to fetch news posts",
        details: error?.message || "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}
