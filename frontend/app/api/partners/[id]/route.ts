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

    const partner = await prisma.partner.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        opportunities: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!partner) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    return NextResponse.json({ partner }, { headers: corsHeaders })
  } catch (error: any) {
    console.error("[PARTNER API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch partner" },
      { status: 500, headers: corsHeaders }
    )
  }
}
