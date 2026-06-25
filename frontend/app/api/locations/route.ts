import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isFeatureEnabled } from "@/lib/feature-flags"

export async function GET() {
  if (!isFeatureEnabled("visitorManagement") && !isFeatureEnabled("spaceInventory")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const locations = await prisma.location.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ locations })
  } catch (error) {
    console.error("[LOCATIONS API]", error)
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}
