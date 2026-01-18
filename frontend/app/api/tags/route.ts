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
 * Get all tags (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const tags = await prisma.newsTag.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                post: {
                  status: "published",
                  deletedAt: null,
                }
              }
            }
          }
        }
      },
    })

    return NextResponse.json(
      { tags },
      {
        headers: corsHeaders(request),
      }
    )
  } catch (error: any) {
    console.error("[TAGS API] Error fetching tags:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch tags",
        details: error?.message || "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}
