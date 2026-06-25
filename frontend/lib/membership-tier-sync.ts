import type { Plan, PrismaClient } from "@prisma/client"
import {
  MEMBERSHIP_TIERS,
  type MembershipTier,
  parseMembershipTier,
  pickHigherTier,
  startOfAllowanceMonth,
} from "@/lib/membership-tier"

/** Map a billing plan to a platform membership tier (when applicable). */
export function membershipTierFromPlan(plan: Pick<Plan, "name">): MembershipTier | null {
  const name = plan.name.toLowerCase()
  if (name.includes("star connect")) return MEMBERSHIP_TIERS.STAR_CONNECT
  if (name.includes("organisational") || name.includes("organizational")) {
    return MEMBERSHIP_TIERS.ORGANISATIONAL
  }
  return null
}

export type SyncMembershipTierResult = {
  previousTier: MembershipTier | null
  tier: MembershipTier | null
  changed: boolean
}

/** After a paid plan is activated, upgrade the member profile tier when the plan maps to one. */
export async function syncMembershipTierForPaidPlan(
  prisma: PrismaClient,
  userId: string,
  plan: Plan
): Promise<SyncMembershipTierResult> {
  const fromPlan = membershipTierFromPlan(plan)
  if (!fromPlan) {
    return { previousTier: null, tier: null, changed: false }
  }

  const profile = await prisma.memberProfile.findUnique({
    where: { userId },
    select: { membershipTier: true },
  })

  const previousTier = parseMembershipTier(profile?.membershipTier)
  const finalTier = pickHigherTier(previousTier, fromPlan) ?? fromPlan
  const changed = previousTier !== finalTier
  const periodStart = startOfAllowanceMonth()

  await prisma.memberProfile.upsert({
    where: { userId },
    create: {
      userId,
      skills: [],
      availability: [],
      interests: [],
      membershipTier: finalTier,
      meetingRoomFreeMinutesUsed: 0,
      meetingRoomAllowancePeriodStart: periodStart,
    },
    update: {
      membershipTier: finalTier,
      ...(changed
        ? {
            meetingRoomFreeMinutesUsed: 0,
            meetingRoomAllowancePeriodStart: periodStart,
          }
        : {}),
    },
  })

  return { previousTier, tier: finalTier, changed }
}
