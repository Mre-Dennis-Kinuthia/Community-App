"use client"

import { PillTabs } from "@/components/mobile/pill-tabs"

interface EventsHeaderProps {
  activeTab: "upcoming" | "past"
  onTabChange: (tab: "upcoming" | "past") => void
  upcomingCount?: number
}

export function EventsHeader({ activeTab, onTabChange, upcomingCount }: EventsHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Events</h1>
        <p className="hidden text-sm text-muted-foreground sm:block md:text-base max-w-2xl">
          Workshops, networking sessions, and programs from Impact Hub Nairobi.
        </p>
      </div>
      <PillTabs
        items={[
          { value: "upcoming", label: "Upcoming", count: upcomingCount },
          { value: "past", label: "Past" },
        ]}
        value={activeTab}
        onChange={(v) => onTabChange(v as "upcoming" | "past")}
      />
    </div>
  )
}
