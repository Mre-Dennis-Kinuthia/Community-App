import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"
import { LocationResolutionError, resolveLocationId } from "@/lib/space/locations"
import { z } from "zod"

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export async function GET() {
  if (!isFeatureEnabled("spaceInventory")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = await resolveUserIdFromSession(session)
    if (!userId) {
      console.log("[CHECK-IN API GET] Unauthorized - unable to resolve user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date()
    const checkIn = await prisma.checkIn.findFirst({
      where: {
        userId,
        checkedInAt: { gte: startOfDay(today), lte: endOfDay(today) },
        checkedOutAt: null,
      },
      include: { location: { select: { id: true, name: true } } },
    })

    const assignment = await prisma.deskAssignment.findFirst({
      where: { userId, status: "active" },
      include: {
        spaceAsset: {
          include: {
            zone: { include: { floor: { include: { location: true } } } },
          },
        },
      },
    })

    return NextResponse.json({
      checkedIn: !!checkIn,
      checkIn: checkIn
        ? { id: checkIn.id, location: checkIn.location, checkedInAt: checkIn.checkedInAt }
        : null,
      assignment: assignment
        ? {
            assetName: assignment.spaceAsset.name,
            assetType: assignment.spaceAsset.type,
            location: assignment.spaceAsset.zone.floor.location.name,
          }
        : null,
    })
  } catch (error) {
    console.error("[CHECK-IN API GET]", error)
    return NextResponse.json({ error: "Failed to fetch check-in status" }, { status: 500 })
  }
}

const checkInBodySchema = z.object({
  locationId: z.string().optional(),
  workspaceId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  if (!isFeatureEnabled("spaceInventory")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = await resolveUserIdFromSession(session)
    if (!userId) {
      console.log("[CHECK-IN API POST] Unauthorized - unable to resolve user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = checkInBodySchema.parse(await request.json().catch(() => ({})))
    const locationId = await resolveLocationId({
      locationId: body.locationId,
      workspaceId: body.workspaceId,
    })

    const today = new Date()
    const existing = await prisma.checkIn.findFirst({
      where: {
        userId,
        locationId,
        checkedInAt: { gte: startOfDay(today), lte: endOfDay(today) },
        checkedOutAt: null,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Already checked in today", checkIn: existing },
        { status: 409 }
      )
    }

    const checkIn = await prisma.checkIn.create({
      data: { userId, locationId, method: "app" },
      include: { location: { select: { id: true, name: true } } },
    })

    const { syncAccessForCheckIn } = await import("@/lib/integrations/access-control")
    await syncAccessForCheckIn(checkIn).catch((err) => console.error("[ACCESS CHECK-IN]", err))

    return NextResponse.json({ checkIn }, { status: 201 })
  } catch (error) {
    if (error instanceof LocationResolutionError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
    console.error("[CHECK-IN API POST]", error)
    return NextResponse.json({ error: "Failed to check in" }, { status: 500 })
  }
}
