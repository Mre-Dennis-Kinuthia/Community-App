import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/partners
 * Get all partners with filtering (uses full Partner schema: type, category, locationType, focus, description)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""
    const category = searchParams.get("category") || ""
    const location = searchParams.get("location") || ""
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "100", 10), 1), 200)
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0)

    const where: {
      deletedAt: null
      name?: { contains: string; mode: "insensitive" }
      type?: string
      category?: string
      locationType?: string
      OR?: Array<{ description?: { contains: string; mode: "insensitive" }; focus?: { has: string } }>
    } = {
      deletedAt: null,
    }

    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
        { focus: { has: search.trim() } },
      ]
    }

    if (type) where.type = type
    if (category) where.category = category
    if (location) where.locationType = location

    const [rows, total, typeRows, categoryRows, locationRows] = await Promise.all([
      prisma.partner.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
        include: {
          _count: { select: { opportunities: { where: { deletedAt: null } } } },
        },
      }),
      prisma.partner.count({ where }),
      prisma.partner.findMany({ where: { deletedAt: null }, select: { type: true }, distinct: ["type"] }),
      prisma.partner.findMany({ where: { deletedAt: null }, select: { category: true }, distinct: ["category"] }),
      prisma.partner.findMany({ where: { deletedAt: null }, select: { locationType: true }, distinct: ["locationType"] }),
    ])

    const partners = rows.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type ?? "Partner",
      category: p.category ?? "",
      description: p.description ?? "",
      logoUrl: p.logoUrl ?? null,
      website: p.website ?? null,
      location: p.location ?? null,
      locationType: p.locationType ?? "",
      focus: p.focus ?? [],
      contactEmail: p.contactEmail ?? null,
      isFeatured: p.isFeatured ?? false,
      createdAt: p.createdAt,
      opportunitiesCount: p._count.opportunities,
    }))

    const filters = {
      types: typeRows.map((r) => r.type).filter(Boolean) as string[],
      categories: categoryRows.map((r) => r.category).filter(Boolean) as string[],
      locationTypes: locationRows.map((r) => r.locationType).filter(Boolean) as string[],
    }

    if (filters.types.length === 0) filters.types = ["Partner"]
    if (filters.categories.length === 0) filters.categories = []
    if (filters.locationTypes.length === 0) filters.locationTypes = []

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
