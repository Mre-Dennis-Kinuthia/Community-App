import useSWR from "swr"
import { useEffect, useRef } from "react"
import {
  clearOrganisationalSignupPending,
  hasOrganisationalSignupPending,
} from "@/lib/membership-pending-intent"
import { MEMBERSHIP_TIERS } from "@/lib/membership-tier"

export type MembershipBenefits = {
  tier: string | null
  label: string | null
  canBookHotDesk: boolean
  meetingRoom: {
    allowanceMinutes: number
    usedMinutes: number
    remainingMinutes: number
    periodStart: string
  }
}

async function fetchProfileMembership(): Promise<MembershipBenefits | null> {
  const res = await fetch("/api/profile", { credentials: "include" })
  if (!res.ok) return null
  const data = await res.json()
  return data.profile?.membership ?? null
}

async function flushOrganisationalSignupPending(): Promise<void> {
  if (!hasOrganisationalSignupPending()) return
  try {
    await fetch("/api/membership/organisational/registration-notify", {
      method: "POST",
      credentials: "include",
    })
  } finally {
    clearOrganisationalSignupPending()
  }
}

export function useMembershipBenefits() {
  const flushed = useRef(false)
  const { data, error, isLoading, mutate } = useSWR<MembershipBenefits | null>(
    "profile-membership",
    async () => {
      if (!flushed.current && hasOrganisationalSignupPending()) {
        flushed.current = true
        await flushOrganisationalSignupPending()
      }
      return fetchProfileMembership()
    },
    { revalidateOnFocus: true }
  )

  useEffect(() => {
    if (!data || !hasOrganisationalSignupPending()) return
    if (
      data.tier === MEMBERSHIP_TIERS.ORGANISATIONAL ||
      data.tier === MEMBERSHIP_TIERS.STAR_CONNECT
    ) {
      clearOrganisationalSignupPending()
    }
  }, [data])

  return {
    membership: data ?? null,
    isLoading,
    error,
    refresh: mutate,
  }
}
