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
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "100", 10), 1), 200)
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0)

    const where: { deletedAt: null; name?: { contains: string; mode: "insensitive" } } = {
      deletedAt: null,
    }

    if (search.trim()) {
      where.name = { contains: search.trim(), mode: "insensitive" }
    }

    const [rows, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.partner.count({ where }),
    ])

    const partners = rows.map((p) => ({
      id: p.id,
      name: p.name,
      logoUrl: p.logoUrl ?? null,
      website: p.website ?? null,
      createdAt: p.createdAt,
      type: "Partner",
      category: "",
      description: "",
      focus: [] as string[],
      locationType: "",
    }))

    const filters = {
      types: ["Partner"],
      categories: [] as string[],
      locationTypes: [] as string[],
    }

    return NextResponse.json(
      {
        partners,
        total,
        limit,
        offset,
        filters,
      },
      { headers: corsHeaders }
    )
  } catch (error: unknown) {
    console.error("[PARTNERS API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500, headers: corsHeaders }
    )
  }
}
