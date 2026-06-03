import {
  getMembershipTierLabel,
  parseMembershipTier,
  canBookHotDesk,
  resolveAllowanceState,
  MEMBERSHIP_TIERS,
  type MembershipTier,
} from "@/lib/membership-tier"

export type ProfileMembershipSlice = {
  membershipTier: string | null
  meetingRoomFreeMinutesUsed: number
  meetingRoomAllowancePeriodStart: Date | null
}

export function buildMembershipSummary(profile: ProfileMembershipSlice | null) {
  const storedTier = parseMembershipTier(profile?.membershipTier)
  const tier: MembershipTier = storedTier ?? MEMBERSHIP_TIERS.COMMUNITY
  const allowance = resolveAllowanceState({
    tier,
    meetingRoomFreeMinutesUsed: profile?.meetingRoomFreeMinutesUsed ?? 0,
    meetingRoomAllowancePeriodStart:
      profile?.meetingRoomAllowancePeriodStart ?? null,
  })

  return {
    tier: storedTier ?? MEMBERSHIP_TIERS.COMMUNITY,
    storedTier,
    label: getMembershipTierLabel(tier),
    canBookHotDesk: canBookHotDesk(tier),
    meetingRoom: {
      allowanceMinutes: allowance.allowanceMinutes,
      usedMinutes: allowance.usedMinutes,
      remainingMinutes: allowance.remainingMinutes,
      periodStart: allowance.periodStart.toISOString(),
    },
  }
}

export async function loadProfileMembership(userId: string) {
  const { prisma } = await import("@/lib/prisma")
  const profile = await prisma.memberProfile.findUnique({
    where: { userId },
    select: {
      membershipTier: true,
      meetingRoomFreeMinutesUsed: true,
      meetingRoomAllowancePeriodStart: true,
    },
  })
  return buildMembershipSummary(profile)
}
