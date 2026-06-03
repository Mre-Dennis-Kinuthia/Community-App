import {
  assignMembershipTierForUser,
  type AssignMembershipTierOptions,
} from "@/lib/membership-tier-resolve"
import {
  MEMBERSHIP_TIERS,
  type MembershipTier,
} from "@/lib/membership-tier"
import { sendMembershipTierRecognizedEmail } from "@/lib/email/membership-tier-recognized"
import { isEmailConfigured, sendEmailInBackground } from "@/lib/email/send"

export function queueMembershipTierRecognitionEmail(args: {
  email: string
  name?: string | null
  tier: MembershipTier
}): boolean {
  if (!isEmailConfigured()) return false
  sendEmailInBackground(
    () =>
      sendMembershipTierRecognizedEmail({
        to: args.email,
        name: args.name,
        tier: args.tier,
      }),
    "membership-tier-recognized"
  )
  return true
}

/** Send recognition when tier upgrades from a prior Star Connect / org application */
export function maybeNotifyMembershipTierUpgrade(args: {
  email: string
  name?: string | null
  result: Awaited<ReturnType<typeof assignMembershipTierForUser>>
}): boolean {
  const shouldNotify =
    args.result.changed &&
    args.result.tier !== MEMBERSHIP_TIERS.COMMUNITY &&
    args.result.source === "ticket"

  if (!shouldNotify) return false
  return queueMembershipTierRecognitionEmail({
    email: args.email,
    name: args.name,
    tier: args.result.tier,
  })
}

export async function syncMembershipTierOnSignup(args: {
  userId: string
  email: string
  name?: string | null
  options?: AssignMembershipTierOptions
}): Promise<{
  tier: MembershipTier
  tierAssigned: boolean
  recognitionEmailQueued: boolean
}> {
  const result = await assignMembershipTierForUser(
    args.userId,
    args.email,
    {
      defaultCommunity: true,
      ...args.options,
    }
  )

  /** Intent sign-ups get tier-specific welcome flows; ticket match gets recognition email */
  const shouldNotify =
    result.changed &&
    result.tier !== MEMBERSHIP_TIERS.COMMUNITY &&
    result.source === "ticket"

  const recognitionEmailQueued = shouldNotify
    ? queueMembershipTierRecognitionEmail({
        email: args.email,
        name: args.name,
        tier: result.tier,
      })
    : false

  return {
    tier: result.tier,
    tierAssigned: result.changed,
    recognitionEmailQueued,
  }
}
