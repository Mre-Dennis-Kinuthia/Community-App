/** Statuses that occupy a confirmed seat toward event capacity. */
export const CONFIRMED_REGISTRATION_STATUSES = ["registered", "attended"] as const

/** Active guest rows excluding cancelled. */
export const ACTIVE_REGISTRATION_STATUSES = [
  "registered",
  "attended",
  "waitlisted",
] as const

export type RegistrationStatus =
  | "registered"
  | "waitlisted"
  | "attended"
  | "cancelled"

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  registered: "Registered",
  waitlisted: "Waitlisted",
  attended: "Attended",
  cancelled: "Cancelled",
}

export function isConfirmedRegistrationStatus(status: string): boolean {
  return CONFIRMED_REGISTRATION_STATUSES.includes(
    status as (typeof CONFIRMED_REGISTRATION_STATUSES)[number]
  )
}

export function registrationStatusBadgeClass(status: string): string {
  const colors: Record<string, string> = {
    registered: "bg-blue-100 text-blue-800",
    waitlisted: "bg-amber-100 text-amber-800",
    cancelled: "bg-gray-100 text-gray-800",
    attended: "bg-green-100 text-green-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

export async function countConfirmedRegistrations(
  prisma: { eventRegistration: { count: (args: object) => Promise<number> } },
  eventId: string
): Promise<number> {
  return prisma.eventRegistration.count({
    where: {
      eventId,
      status: { in: [...CONFIRMED_REGISTRATION_STATUSES] },
    },
  })
}

export async function getRegistrationCountsByEventIds(
  prisma: { eventRegistration: { groupBy: (args: object) => Promise<Array<{ eventId: string; _count: { _all: number } }>> } },
  eventIds: string[]
): Promise<Map<string, { confirmed: number; waitlisted: number }>> {
  const map = new Map<string, { confirmed: number; waitlisted: number }>()
  if (eventIds.length === 0) return map

  const [confirmedGroups, waitlistedGroups] = await Promise.all([
    prisma.eventRegistration.groupBy({
      by: ["eventId"],
      where: {
        eventId: { in: eventIds },
        status: { in: [...CONFIRMED_REGISTRATION_STATUSES] },
      },
      _count: { _all: true },
    }),
    prisma.eventRegistration.groupBy({
      by: ["eventId"],
      where: {
        eventId: { in: eventIds },
        status: "waitlisted",
      },
      _count: { _all: true },
    }),
  ])

  for (const id of eventIds) {
    map.set(id, { confirmed: 0, waitlisted: 0 })
  }
  for (const row of confirmedGroups) {
    const current = map.get(row.eventId) ?? { confirmed: 0, waitlisted: 0 }
    current.confirmed = row._count._all
    map.set(row.eventId, current)
  }
  for (const row of waitlistedGroups) {
    const current = map.get(row.eventId) ?? { confirmed: 0, waitlisted: 0 }
    current.waitlisted = row._count._all
    map.set(row.eventId, current)
  }

  return map
}

export function eventHasCapacity(event: { capacity: number | null }, confirmedCount: number): boolean {
  if (event.capacity == null) return true
  return confirmedCount < event.capacity
}

export function resolveRegistrationStatusForEvent(
  event: { capacity: number | null; waitlistEnabled: boolean },
  confirmedCount: number
): RegistrationStatus {
  if (eventHasCapacity(event, confirmedCount)) {
    return "registered"
  }
  if (event.waitlistEnabled) {
    return "waitlisted"
  }
  throw new Error("Event is at full capacity")
}
