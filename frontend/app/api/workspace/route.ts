import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/** True if the error indicates DB is missing or unreachable (so we return workspace: null instead of 500). */
function isDatabaseUnavailableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  const code = (error as { code?: string })?.code
  return (
    !process.env.DATABASE_URL ||
    /DATABASE_URL|not set|ECONNREFUSED|connection refused|connect ECONNREFUSED|P1001|P1017|Connection|timeout|getaddrinfo/i.test(msg) ||
    code === "P1001" ||
    code === "P1017"
  )
}

/**
 * GET /api/workspace
 * Get workspace information from database.
 * If DATABASE_URL is missing or DB is unreachable, returns 200 with workspace: null
 * so the booking page can show "No active workspace configured" instead of a 500.
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

    // Map DB workspace to API shape expected by frontend components.
    // Where extended fields are not configured yet, we fall back to safe defaults.
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
      amenities: (dbWorkspace.amenities as any[]) ?? [],
      whoIsThisFor: dbWorkspace.whoIsThisFor ?? "",
      openingHours: dbWorkspace.openingHours ?? "",
      houseRules: dbWorkspace.houseRules ?? [],
      securityInfo: dbWorkspace.securityInfo ?? "",
      coordinates: (dbWorkspace.coordinates as any) ?? { lat: 0, lng: 0 },
      landmarks: dbWorkspace.landmarks ?? [],
      companyLogos: dbWorkspace.companyLogos ?? [],
      pricing: (dbWorkspace.pricing as any) ?? null,
    }

    return NextResponse.json({ workspace }, { headers: corsHeaders })
  } catch (error: unknown) {
    console.error("[WORKSPACE API] Error:", error)

    // Never 500 the client: return 200 with workspace: null so the booking page
    // can show "No active workspace configured" or "Database unavailable".
    const message = isDatabaseUnavailableError(error)
      ? "Database unavailable"
      : "Failed to fetch workspace"
    return NextResponse.json(
      { workspace: null, error: message },
      { status: 200, headers: corsHeaders }
    )
  }
}
