import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/partners
 * Get all partners with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const category = searchParams.get("category") || ""
    const location = searchParams.get("location") || ""
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {
      deletedAt: null,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { focus: { has: search } },
      ]
    }

    if (type) {
      where.type = type
    }

    if (category) {
      where.category = category
    }

    if (location) {
      where.locationType = location
    }

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: {
            select: {
              opportunities: true,
            },
          },
        },
      }),
      prisma.partner.count({ where }),
    ])

    return NextResponse.json(
      {
        partners,
        total,
        limit,
        offset,
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[PARTNERS API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500, headers: corsHeaders }
    )
  }
}
