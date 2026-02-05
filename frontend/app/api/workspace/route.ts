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
 * GET /api/workspace
 * Get workspace information from database
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const workspaceId = searchParams.get("id")
    const slug = searchParams.get("slug")

    let dbWorkspace = null

    if (workspaceId) {
      dbWorkspace = await prisma.workspace.findFirst({
        where: { id: workspaceId, deletedAt: null },
      })
    } else if (slug) {
      dbWorkspace = await prisma.workspace.findFirst({
        where: { slug: slug.toLowerCase(), deletedAt: null },
      })
    } else {
      // Default: first active workspace
      dbWorkspace = await prisma.workspace.findFirst({
        where: { isActive: true, deletedAt: null },
        orderBy: { createdAt: "asc" },
      })
    }

    if (!dbWorkspace) {
      return NextResponse.json(
        { workspace: null, error: "Workspace not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    // Map DB workspace to API shape expected by frontend components
    const workspace = {
      id: dbWorkspace.id,
      name: dbWorkspace.name,
      location: dbWorkspace.location ?? "",
      address: dbWorkspace.address ?? "",
      valueProposition: dbWorkspace.valueProposition ?? "",
      startingPrice: dbWorkspace.startingPrice ?? 0,
      currency: dbWorkspace.currency,
      rating: 0,
      reviewCount: 0,
      images: dbWorkspace.images ?? [],
      amenities: [],
      whoIsThisFor: "",
      openingHours: "",
      houseRules: [] as string[],
      securityInfo: "",
      coordinates: { lat: 0, lng: 0 },
      landmarks: [] as string[],
      companyLogos: [] as string[],
    }

    return NextResponse.json({ workspace }, { headers: corsHeaders })
  } catch (error: any) {
    console.error("[WORKSPACE API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch workspace" },
      { status: 500, headers: corsHeaders }
    )
  }
}
