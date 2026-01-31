import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/partners/[id]
 * Get a single partner with opportunities
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const row = await prisma.partner.findUnique({
      where: {
        id,
        deletedAt: null,
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
      logoUrl: row.logoUrl ?? null,
      website: row.website ?? null,
      createdAt: row.createdAt,
      type: "Partner",
      category: "",
      description: "",
      focus: [] as string[],
      locationType: "",
      opportunities: [] as unknown[],
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
