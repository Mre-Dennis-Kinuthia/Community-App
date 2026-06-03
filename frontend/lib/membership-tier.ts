/**
 * Platform membership tier (Community / Star Connect / Organisational).
 * Distinct from memberType (entrepreneur, partner, etc.).
 */

export const MEMBERSHIP_TIERS = {
  COMMUNITY: "community",
  STAR_CONNECT: "star_connect",
  ORGANISATIONAL: "organisational",
} as const

export type MembershipTier =
  (typeof MEMBERSHIP_TIERS)[keyof typeof MEMBERSHIP_TIERS]

export const MEMBERSHIP_TIER_LABELS: Record<MembershipTier, string> = {
  community: "Community member",
  star_connect: "Star Connect member",
  organisational: "Organisational member",
}

/** Monthly included meeting-room time (minutes) */
export const MEETING_ROOM_ALLOWANCE_MINUTES: Record<
  MembershipTier,
  number
> = {
  community: 0,
  star_connect: 120,
  organisational: 600,
}

const TIER_RANK: Record<MembershipTier, number> = {
  community: 0,
  star_connect: 1,
  organisational: 2,
}

export function parseMembershipTier(
  value: string | null | undefined
): MembershipTier | null {
  if (value === MEMBERSHIP_TIERS.COMMUNITY) return MEMBERSHIP_TIERS.COMMUNITY
  if (value === MEMBERSHIP_TIERS.STAR_CONNECT) return MEMBERSHIP_TIERS.STAR_CONNECT
  if (value === MEMBERSHIP_TIERS.ORGANISATIONAL) {
    return MEMBERSHIP_TIERS.ORGANISATIONAL
  }
  return null
}

export function getMembershipTierLabel(
  tier: MembershipTier | null | undefined
): string | null {
  if (!tier) return null
  return MEMBERSHIP_TIER_LABELS[tier] ?? null
}

export function tierRank(tier: MembershipTier | null | undefined): number {
  if (!tier) return -1
  return TIER_RANK[tier] ?? -1
}

export function pickHigherTier(
  a: MembershipTier | null | undefined,
  b: MembershipTier | null | undefined
): MembershipTier | null {
  if (!a) return b ?? null
  if (!b) return a
  return tierRank(a) >= tierRank(b) ? a : b
}

export function canBookHotDesk(tier: MembershipTier | null | undefined): boolean {
  if (!tier || tier === MEMBERSHIP_TIERS.COMMUNITY) return true
  return false
}

export function getMeetingRoomAllowanceMinutes(
  tier: MembershipTier | null | undefined
): number {
  if (!tier) return 0
  return MEETING_ROOM_ALLOWANCE_MINUTES[tier] ?? 0
}

export function startOfAllowanceMonth(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export type AllowanceState = {
  periodStart: Date
  usedMinutes: number
  allowanceMinutes: number
  remainingMinutes: number
}

export function resolveAllowanceState(args: {
  tier: MembershipTier | null | undefined
  meetingRoomFreeMinutesUsed: number
  meetingRoomAllowancePeriodStart: Date | null | undefined
  now?: Date
}): AllowanceState {
  const now = args.now ?? new Date()
  const periodStart = startOfAllowanceMonth(now)
  const allowanceMinutes = getMeetingRoomAllowanceMinutes(args.tier)

  let usedMinutes = args.meetingRoomFreeMinutesUsed ?? 0
  const storedPeriod = args.meetingRoomAllowancePeriodStart
  if (
    !storedPeriod ||
    storedPeriod.getTime() < periodStart.getTime()
  ) {
    usedMinutes = 0
  }

  const remainingMinutes = Math.max(0, allowanceMinutes - usedMinutes)

  return {
    periodStart,
    usedMinutes,
    allowanceMinutes,
    remainingMinutes,
  }
}

export function formatAllowanceHours(minutes: number): string {
  if (minutes <= 0) return "0 hrs"
  const hrs = minutes / 60
  return Number.isInteger(hrs) ? `${hrs} hrs` : `${hrs.toFixed(1)} hrs`
}
