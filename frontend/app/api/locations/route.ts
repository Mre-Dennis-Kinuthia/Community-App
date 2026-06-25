import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { listHubLocations } from "@/lib/space/locations"

export async function GET() {
  if (
    !isFeatureEnabled("visitorManagement") &&
    !isFeatureEnabled("spaceInventory") &&
    !isFeatureEnabled("operationsModule")
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hubs = await listHubLocations()

    return NextResponse.json({
      locations: hubs.map((h) => ({
        id: h.id,
        name: h.name,
        slug: h.slug,
        workspaceId: h.workspaceId,
        workspaceName: h.workspaceName,
      })),
    })
  } catch (error) {
    console.error("[LOCATIONS API]", error)
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}
