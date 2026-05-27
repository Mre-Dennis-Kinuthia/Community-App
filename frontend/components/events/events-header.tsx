"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"

interface EventsHeaderProps {
  activeTab: "upcoming" | "past"
  onTabChange: (tab: "upcoming" | "past") => void
}

export function EventsHeader({ activeTab, onTabChange }: EventsHeaderProps) {
  return (
    <PageHeader
      title="Events"
      description="Workshops, networking sessions, and programs from Impact Hub Nairobi."
    >
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "upcoming" | "past")}>
        <TabsList className="h-9 bg-muted p-1">
          <TabsTrigger value="upcoming" className="rounded-md px-3 py-1.5 text-sm">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-md px-3 py-1.5 text-sm">
            Past
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </PageHeader>
  )
}
