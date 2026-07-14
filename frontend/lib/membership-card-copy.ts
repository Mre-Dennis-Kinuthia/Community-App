import {
  formatAllowanceHours,
  MEETING_ROOM_ALLOWANCE_MINUTES,
  MEMBERSHIP_TIER_LABELS,
  MEMBERSHIP_TIERS,
  parseMembershipTier,
  type MembershipTier,
} from "@/lib/membership-tier"
import type { MembershipBenefits } from "@/lib/hooks/use-membership"

export type MembershipCardCopy = {
  tier: MembershipTier
  label: string
  benefits: string[]
  terms: string
  showBookingCta: boolean
}

const TERMS =
  "Benefits apply while your membership is active. Bookings remain subject to availability and house rules."

function communityBenefits(): string[] {
  return [
    "Access to the Impact Hub Nairobi community and member directory",
    "Book hot desks and paid spaces when you need to work from the Hub",
  ]
}

function starConnectBenefits(membership?: MembershipBenefits | null): string[] {
  const allowance = formatAllowanceHours(MEETING_ROOM_ALLOWANCE_MINUTES.star_connect)
  const remaining = membership?.meetingRoom
    ? formatAllowanceHours(membership.meetingRoom.remainingMinutes)
    : allowance
  return [
    "Workspace access is included — hot desk booking is not required",
    `${allowance} of meeting room time included each month`,
    `Meeting rooms remaining this month: ${remaining}`,
  ]
}

function organisationalBenefits(membership?: MembershipBenefits | null): string[] {
  const allowance = formatAllowanceHours(MEETING_ROOM_ALLOWANCE_MINUTES.organisational)
  const remaining = membership?.meetingRoom
    ? formatAllowanceHours(membership.meetingRoom.remainingMinutes)
    : allowance
  return [
    "Partnership workspace access — hot desk booking is not required",
    `${allowance} of meeting room time included each month`,
    `Meeting rooms remaining this month: ${remaining}`,
  ]
}

export function getMembershipCardCopy(
  membership?: MembershipBenefits | null
): MembershipCardCopy | null {
  const tier =
    parseMembershipTier(membership?.tier) ??
    (membership?.label ? MEMBERSHIP_TIERS.COMMUNITY : null)
  if (!tier) return null

  const label =
    membership?.label?.trim() || MEMBERSHIP_TIER_LABELS[tier]

  if (tier === MEMBERSHIP_TIERS.STAR_CONNECT) {
    return {
      tier,
      label,
      benefits: starConnectBenefits(membership),
      terms: TERMS,
      showBookingCta: true,
    }
  }

  if (tier === MEMBERSHIP_TIERS.ORGANISATIONAL) {
    return {
      tier,
      label,
      benefits: organisationalBenefits(membership),
      terms: TERMS,
      showBookingCta: true,
    }
  }

  return {
    tier: MEMBERSHIP_TIERS.COMMUNITY,
    label,
    benefits: communityBenefits(),
    terms: TERMS,
    showBookingCta: true,
  }
}
