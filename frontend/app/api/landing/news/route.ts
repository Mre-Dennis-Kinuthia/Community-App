import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/landing/news
 * Published news teasers for the marketing landing page.
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get("limit") || "3", 10),
      6
    )

    const posts = await prisma.newsPost.findMany({
      where: {
        deletedAt: null,
        status: "published",
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      },
      orderBy: [{ isPinned: "desc" }, { isFeatured: "desc" }, { publishedAt: "desc" }],
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        imageUrl: true,
        publishedAt: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        posts: posts.map((post) => ({
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          imageUrl: post.imageUrl,
          publishedAt: post.publishedAt?.toISOString() ?? null,
          categoryName: post.category?.name ?? null,
        })),
      },
      { headers: corsHeaders(request) }
    )
  } catch (error) {
    console.error("[LANDING NEWS]", error)
    return NextResponse.json({ posts: [] }, { headers: corsHeaders(request) })
  }
}
