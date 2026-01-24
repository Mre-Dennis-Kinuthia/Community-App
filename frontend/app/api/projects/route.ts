import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/projects
 * Get all projects with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const stage = searchParams.get("stage") || ""
    const location = searchParams.get("location") || ""
    const featured = searchParams.get("featured") === "true"
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {
      deletedAt: null,
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (stage) {
      where.stage = stage
    }

    if (location) {
      where.location = location
    }

    if (featured) {
      where.isFeatured = true
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          founder: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              followers: true,
              volunteers: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ])

    return NextResponse.json(
      {
        projects,
        total,
        limit,
        offset,
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[PROJECTS API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500, headers: corsHeaders }
    )
  }
}
