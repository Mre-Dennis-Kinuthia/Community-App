import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { resourceTypeToAssetType } from "@/lib/space/asset-types"
import { hasAssetBookingConflict, isAssetAvailableForBooking } from "@/lib/space/availability"
import { parseLocalCalendarDay } from "@/lib/date-booking"

function calculateEndTime(startTime: string, duration: string, meetingRoomHours?: number): string {
  const [hours, minutes] = startTime.split(":").map(Number)
  let hoursToAdd = 1
  if (duration === "half-day") hoursToAdd = 4
  else if (duration === "full-day") hoursToAdd = 8
  else if (typeof meetingRoomHours === "number") hoursToAdd = meetingRoomHours
  const endH = Math.min(hours + hoursToAdd, 17)
  return `${endH.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

export async function GET(request: NextRequest) {
  if (!isFeatureEnabled("spaceInventory")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const date = searchParams.get("date")
    const startTime = searchParams.get("startTime")
    const duration = searchParams.get("duration") || "hourly"
    const meetingRoomHours = searchParams.get("meetingRoomHours")
      ? parseInt(searchParams.get("meetingRoomHours")!, 10)
      : undefined

    if (!type || !date) {
      return NextResponse.json({ error: "type and date are required" }, { status: 400 })
    }

    const assetType = resourceTypeToAssetType(type)
    if (!assetType) {
      return NextResponse.json({ error: "Invalid resource type" }, { status: 400 })
    }

    const bounds = parseLocalCalendarDay(date)
    if (!bounds) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    const assets = await prisma.spaceAsset.findMany({
      where: {
        type: assetType as never,
        isBookable: true,
        status: { not: "maintenance" },
      },
      include: {
        zone: {
          include: {
            floor: { include: { location: { select: { id: true, name: true } } } },
          },
        },
      },
      orderBy: { name: "asc" },
    })

    let available = assets.filter(isAssetAvailableForBooking)

    if (startTime) {
      const endTime = calculateEndTime(startTime, duration, meetingRoomHours)
      const conflictChecks = await Promise.all(
        available.map(async (asset) => {
          const conflict = await hasAssetBookingConflict(prisma, {
            spaceAssetId: asset.id,
            dateStart: bounds.start,
            dateEnd: bounds.end,
            startTime,
            endTime,
          })
          return conflict ? null : asset
        })
      )
      available = conflictChecks.filter(Boolean) as typeof assets
    }

    return NextResponse.json({
      assets: available.map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        type: a.type,
        capacity: a.capacity,
        amenities: a.amenities,
        status: a.status,
        location: a.zone.floor.location.name,
        zone: a.zone.name,
        floor: a.zone.floor.name,
      })),
    })
  } catch (error) {
    console.error("[SPACE ASSETS API]", error)
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 })
  }
}
