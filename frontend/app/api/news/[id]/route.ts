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
 * Get a single published news post by ID (public endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const now = new Date()

    const post = await prisma.newsPost.findFirst({
      where: {
        id,
        deletedAt: null,
        status: "published",
        OR: [
          { publishedAt: null }, // Allow posts without publishedAt if status is published
          { publishedAt: { lte: now } }, // Only show posts published in the past
        ],
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
    })

    if (!post) {
      return NextResponse.json(
        { error: "News post not found" },
        {
          status: 404,
          headers: corsHeaders(request),
        }
      )
    }

    return NextResponse.json(
      { post },
      {
        headers: corsHeaders(request),
      }
    )
  } catch (error: any) {
    console.error("[NEWS API] Error fetching news post:", error)

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
        error: "Failed to fetch news post",
        details: error?.message || "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}
