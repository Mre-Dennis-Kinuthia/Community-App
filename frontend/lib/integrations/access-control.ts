import { prisma } from "@/lib/prisma"
import { isFeatureEnabled } from "@/lib/feature-flags"

export type AccessGrantContext = {
  userId: string
  locationId?: string | null
  spaceAssetId?: string | null
  bookingId?: string | null
  checkInId?: string | null
  validFrom?: Date
  validUntil?: Date
}

export interface AccessControlProvider {
  readonly name: string
  grantAccess(ctx: AccessGrantContext): Promise<void>
  revokeAccess(ctx: AccessGrantContext): Promise<void>
}

class NullAccessProvider implements AccessControlProvider {
  readonly name = "null"

  async grantAccess(_ctx: AccessGrantContext): Promise<void> {
    // No-op until a hardware vendor is configured
  }

  async revokeAccess(_ctx: AccessGrantContext): Promise<void> {
    // No-op until a hardware vendor is configured
  }
}

let provider: AccessControlProvider = new NullAccessProvider()

export function setAccessControlProvider(next: AccessControlProvider) {
  provider = next
}

export function getAccessControlProvider(): AccessControlProvider {
  return provider
}

async function loadActiveProvider(): Promise<AccessControlProvider> {
  if (!isFeatureEnabled("accessControl")) return new NullAccessProvider()

  const integration = await prisma.accessControlIntegration.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  })

  if (!integration) return new NullAccessProvider()

  // Vendor-specific providers register here when hardware is chosen
  return new NullAccessProvider()
}

export async function grantMemberAccess(ctx: AccessGrantContext): Promise<void> {
  const active = await loadActiveProvider()
  await active.grantAccess(ctx)
}

export async function revokeMemberAccess(ctx: AccessGrantContext): Promise<void> {
  const active = await loadActiveProvider()
  await active.revokeAccess(ctx)
}

export async function syncAccessForCheckIn(checkIn: {
  id: string
  userId: string
  locationId: string
}): Promise<void> {
  await grantMemberAccess({
    userId: checkIn.userId,
    locationId: checkIn.locationId,
    checkInId: checkIn.id,
    validFrom: new Date(),
  })
}

export async function syncAccessForBooking(booking: {
  id: string
  userId: string
  spaceAssetId?: string | null
  date: Date
  endTime?: string | null
  status: string
}): Promise<void> {
  if (booking.status === "cancelled") {
    await revokeMemberAccess({
      userId: booking.userId,
      spaceAssetId: booking.spaceAssetId,
      bookingId: booking.id,
    })
    return
  }

  if (booking.status !== "confirmed") return

  const validUntil = new Date(booking.date)
  if (booking.endTime) {
    const [h, m] = booking.endTime.split(":").map(Number)
    validUntil.setHours(h, m ?? 0, 0, 0)
  } else {
    validUntil.setHours(23, 59, 59, 999)
  }

  await grantMemberAccess({
    userId: booking.userId,
    spaceAssetId: booking.spaceAssetId,
    bookingId: booking.id,
    validFrom: booking.date,
    validUntil,
  })
}
