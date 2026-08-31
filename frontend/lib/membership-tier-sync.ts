import type { Plan, PrismaClient } from "@prisma/client"
import {
  MEMBERSHIP_TIERS,
  type MembershipTier,
  parseMembershipTier,
  pickHigherTier,
  startOfAllowanceMonth,
} from "@/lib/membership-tier"
import { membershipTierForPricingCategory } from "@/lib/workspace-pricing"

/** Map a billing plan to a platform membership tier (when applicable). */
export function membershipTierFromPlan(plan: {
  name: string
  pricingCategoryId?: string | null
}): MembershipTier | null {
  const fromCategory = membershipTierForPricingCategory(plan.pricingCategoryId)
  if (fromCategory === "star_connect") return MEMBERSHIP_TIERS.STAR_CONNECT
  if (fromCategory === "organisational") return MEMBERSHIP_TIERS.ORGANISATIONAL
  if (fromCategory === "community") return MEMBERSHIP_TIERS.COMMUNITY

  const name = plan.name.toLowerCase()
  if (name.includes("star connect") || name.includes("community monthly") || name.includes("dedicated desk")) {
    return MEMBERSHIP_TIERS.STAR_CONNECT
  }
  if (
    name.includes("organisational") ||
    name.includes("organizational") ||
    name.includes("organisation") ||
    name.includes("organization") ||
    name.includes("company")
  ) {
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
