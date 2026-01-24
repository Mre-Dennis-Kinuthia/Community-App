import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/resources
 * Get all resources with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const category = searchParams.get("category") || ""
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

    if (type) {
      where.type = type
    }

    if (category) {
      where.category = category
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.resource.count({ where }),
    ])

    return NextResponse.json(
      {
        resources,
        total,
        limit,
        offset,
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[RESOURCES API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500, headers: corsHeaders }
    )
  }
}
