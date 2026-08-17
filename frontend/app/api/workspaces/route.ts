import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { BOOKING_SPACE_COVER } from "@/lib/booking-space-images"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/workspaces
 * List active workspace listings for the booking picker.
 */
export async function GET(request: NextRequest) {
  try {
    const rows = await prisma.workspace.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        startingPrice: true,
        currency: true,
        valueProposition: true,
      },
    })

    const workspaces = rows.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      location: w.location ?? "",
      startingPrice: w.startingPrice ?? 0,
      currency: w.currency,
      valueProposition: w.valueProposition ?? "",
      coverImage: BOOKING_SPACE_COVER,
    }))

    return NextResponse.json({ workspaces }, { headers: corsHeaders })
  } catch (error: unknown) {
    console.error("[WORKSPACES API] Error:", error)
    return NextResponse.json(
      { workspaces: [], error: "Failed to list workspaces" },
      { status: 200, headers: corsHeaders }
    )
  }
}
