import {
  getMeetingRoomAllowanceMinutes,
  type AllowanceState,
  type MembershipTier,
} from "@/lib/membership-tier"

export type MeetingRoomBenefitInput = {
  tier: MembershipTier | null | undefined
  allowance: AllowanceState
  resourceType: string
  meetingRoomHours?: number
  basePrice: number
  addOnsPrice: number
}

export type MeetingRoomBenefitResult = {
  listPrice: number
  membershipDiscount: number
  freeMeetingRoomMinutesApplied: number
  totalPrice: number
}

export function applyMembershipBookingBenefits(
  input: MeetingRoomBenefitInput
): MeetingRoomBenefitResult {
  const listPrice = input.basePrice + input.addOnsPrice

  if (input.resourceType !== "meeting-room") {
    return {
      listPrice,
      membershipDiscount: 0,
      freeMeetingRoomMinutesApplied: 0,
      totalPrice: listPrice,
    }
  }

  const bookingMinutes = Math.max(1, Math.round((input.meetingRoomHours ?? 1) * 60))
  const freeMinutesToApply = Math.min(
    input.allowance.remainingMinutes,
    bookingMinutes
  )

  if (freeMinutesToApply <= 0 || input.basePrice <= 0) {
    return {
      listPrice,
      membershipDiscount: 0,
      freeMeetingRoomMinutesApplied: 0,
      totalPrice: listPrice,
    }
  }

  const hourlyRate = input.basePrice / (bookingMinutes / 60)
  const discountOnBase = hourlyRate * (freeMinutesToApply / 60)
  const membershipDiscount = Math.min(input.basePrice, discountOnBase)
  const totalPrice = Math.max(0, listPrice - membershipDiscount)

  return {
    listPrice,
    membershipDiscount,
    freeMeetingRoomMinutesApplied: freeMinutesToApply,
    totalPrice,
  }
}

export function describeMeetingRoomBenefit(
  tier: MembershipTier | null | undefined,
  allowance: AllowanceState
): string | null {
  const total = getMeetingRoomAllowanceMinutes(tier)
  if (total <= 0) return null
  const remaining = allowance.remainingMinutes
  if (remaining <= 0) {
    return `${total / 60} hrs free meeting room per month — allowance used this month`
  }
  return `${remaining / 60} hrs free meeting room remaining this month`
}
