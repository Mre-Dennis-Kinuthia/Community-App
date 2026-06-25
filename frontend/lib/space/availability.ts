import type { PrismaClient } from "@prisma/client"

type TimeRange = { startTime: string; endTime: string | null }

function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return aStart < bEnd && aEnd > bStart
}

/** Check if a space asset has a conflicting booking for the given slot */
export async function hasAssetBookingConflict(
  prisma: PrismaClient,
  params: {
    spaceAssetId: string
    dateStart: Date
    dateEnd: Date
    startTime: string
    endTime: string
    excludeBookingId?: string
  }
): Promise<boolean> {
  const bookings = await prisma.workspaceBooking.findMany({
    where: {
      spaceAssetId: params.spaceAssetId,
      date: { gte: params.dateStart, lte: params.dateEnd },
      status: { not: "cancelled" },
      ...(params.excludeBookingId ? { id: { not: params.excludeBookingId } } : {}),
    },
    select: { startTime: true, endTime: true },
  })

  return bookings.some((b) =>
    rangesOverlap(
      params.startTime,
      params.endTime,
      b.startTime,
      b.endTime || b.startTime
    )
  )
}

/** Filter assets that are bookable and not in maintenance */
export function isAssetAvailableForBooking(asset: {
  isBookable: boolean
  status: string
}): boolean {
  return asset.isBookable && asset.status !== "maintenance"
}

export function bookingEndFromStart(
  startTime: string,
  endTime: string | null,
  duration: string
): string {
  if (endTime) return endTime
  const [h, m] = startTime.split(":").map(Number)
  let add = 1
  if (duration === "half-day") add = 4
  else if (duration === "full-day") add = 8
  const endH = Math.min(h + add, 17)
  return `${endH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}
