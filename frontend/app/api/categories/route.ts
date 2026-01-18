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
 * Get all categories (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: "published",
                deletedAt: null,
              }
            }
          }
        }
      },
    })

    return NextResponse.json(
      { categories },
      {
        headers: corsHeaders(request),
      }
    )
  } catch (error: any) {
    console.error("[CATEGORIES API] Error fetching categories:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        details: error?.message || "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}
