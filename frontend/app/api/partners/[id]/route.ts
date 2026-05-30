import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/partners/[id]
 * Get a single partner with opportunities (full schema: description, type, category, focus, PartnerOpportunity[])
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // findFirst: deletedAt is not part of a unique constraint (findUnique cannot filter on it)
    const row = await prisma.partner.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        opportunities: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!row) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    const partner = {
      id: row.id,
      name: row.name,
      type: row.type ?? "Partner",
      category: row.category ?? "",
      description: row.description ?? "",
      logoUrl: row.logoUrl ?? null,
      website: row.website ?? null,
      location: row.location ?? null,
      locationType: row.locationType ?? "",
      focus: row.focus ?? [],
      contactEmail: row.contactEmail ?? null,
      isFeatured: row.isFeatured ?? false,
      createdAt: row.createdAt,
      opportunities: row.opportunities.map((o) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        category: o.category ?? null,
        amount: o.amount ?? null,
        deadline: o.deadline,
        eligibility: o.eligibility ?? [],
        applicationProcess: o.applicationProcess ?? [],
        status: o.status,
        createdAt: o.createdAt,
      })),
    }

    return NextResponse.json({ partner }, { headers: corsHeaders })
  } catch (error: unknown) {
    console.error("[PARTNER API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch partner" },
      { status: 500, headers: corsHeaders }
    )
  }
}
