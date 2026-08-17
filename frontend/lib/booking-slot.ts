import type { PrismaClient } from "@prisma/client"
import { hasAssetBookingConflict } from "@/lib/space/availability"

export type BookingSlotInput = {
  userId: string
  resourceType: string
  date: Date
  startTime: string
  duration: string
  meetingRoomHours?: number
  workspaceId?: string
  spaceAssetId?: string | null
  excludeBookingId?: string
}

export type SlotAvailabilityResult =
  | { available: true }
  | { available: false; reason: string }

/** Calculate end time based on start time and duration */
export function calculateBookingEndTime(
  startTime: string,
  duration: string,
  resourceType?: string,
  meetingRoomHours?: number
): string {
  const [hours, minutes] = startTime.split(":").map(Number)
  let hoursToAdd = 1

  if (duration === "monthly") {
    return "17:00"
  }
  if (resourceType === "meeting-room" && typeof meetingRoomHours === "number" && meetingRoomHours >= 1) {
    hoursToAdd = meetingRoomHours
  } else if (duration === "half-day") {
    hoursToAdd = 4
  } else if (duration === "full-day") {
    hoursToAdd = 8
  }

  const endHours = hours + hoursToAdd
  const cappedEnd = Math.min(endHours, 17)
  const finalHours = cappedEnd >= 24 ? cappedEnd - 24 : cappedEnd
  return `${finalHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

/** Normalize start time rules shared by verify and create flows */
export function normalizeBookingStartTime(
  resourceType: string,
  duration: string,
  startTime: string
): { startTime: string } | { error: string } {
  let normalized = startTime

  if (resourceType === "private-office" && duration === "monthly") {
    normalized = "09:00"
  } else if (resourceType === "hot-desk") {
    if (duration === "full-day") {
      normalized = "09:00"
    } else if (duration === "half-day") {
      if (startTime !== "09:00" && startTime !== "13:00") {
        return { error: "Half-day bookings must start at 9:00 AM (morning) or 1:00 PM (afternoon)" }
      }
    }
  }

  if (!normalized) {
    return { error: "Start time is required" }
  }

  return { startTime: normalized }
}

/** Server-side check that a booking slot is still available */
export async function checkBookingSlotAvailable(
  prisma: PrismaClient,
  params: BookingSlotInput
): Promise<SlotAvailabilityResult> {
  const normalized = normalizeBookingStartTime(
    params.resourceType,
    params.duration,
    params.startTime
  )
  if ("error" in normalized) {
    return { available: false, reason: normalized.error }
  }

  const startTime = normalized.startTime
  const endTime = calculateBookingEndTime(
    startTime,
    params.duration,
    params.resourceType,
    params.meetingRoomHours
  )

  const bookingDate = new Date(params.date)
  const startOfDay = new Date(bookingDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(bookingDate)
  endOfDay.setHours(23, 59, 59, 999)

  const conflictWhere: Record<string, unknown> = {
    resourceType: params.resourceType,
    date: {
      gte: startOfDay,
      lte: endOfDay,
    },
    status: {
      not: "cancelled",
    },
    ...(params.excludeBookingId ? { id: { not: params.excludeBookingId } } : {}),
  }

  if (params.resourceType === "hot-desk") {
    conflictWhere.userId = params.userId
  }

  const conflictingBooking = await prisma.workspaceBooking.findFirst({
    where: {
      ...conflictWhere,
      OR: [
        {
          AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
        },
        {
          AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
        },
        {
          AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
        },
        {
          AND: [{ startTime: { lte: startTime } }, { endTime: { gte: endTime } }],
        },
      ],
    },
  })

  if (conflictingBooking) {
    const reason =
      params.resourceType === "hot-desk"
        ? "You already have a booking for this time slot."
        : "This time slot is already booked. Please select a different time."
    return { available: false, reason }
  }

  if (params.spaceAssetId) {
    const asset = await prisma.spaceAsset.findUnique({
      where: { id: params.spaceAssetId },
    })
    if (!asset || !asset.isBookable || asset.status === "maintenance") {
      return { available: false, reason: "Selected space is not available for booking." }
    }

    const assetConflict = await hasAssetBookingConflict(prisma, {
      spaceAssetId: params.spaceAssetId,
      dateStart: startOfDay,
      dateEnd: endOfDay,
      startTime,
      endTime,
      excludeBookingId: params.excludeBookingId,
    })

    if (assetConflict) {
      return { available: false, reason: "This space is already booked for the selected time." }
    }
  }

  return { available: true }
}
