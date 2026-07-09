"use client"

import useSWR from "swr"
import type { NavBadgeKey } from "@/lib/nav-config"

type DashboardStats = {
  upcomingEvents: number
}

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => (res.ok ? res.json() : null))

export function useNavBadges(): Partial<Record<NavBadgeKey, number>> {
  const { data } = useSWR<DashboardStats | null>("/api/dashboard/stats", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  if (!data?.upcomingEvents) return {}

  return {
    upcomingEvents: data.upcomingEvents,
  }
}
