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
 * Also increments view count
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
        slug: true,
        content: true,
        excerpt: true,
        imageUrl: true,
        publishedAt: true,
        createdAt: true,
        isFeatured: true,
        isPinned: true,
        viewCount: true,
        readingTimeMinutes: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        },
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

    // Increment view count (fire and forget - don't wait for it)
    prisma.newsPost.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
      },
    }).catch(err => console.error("[NEWS API] Failed to increment view count:", err))

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
