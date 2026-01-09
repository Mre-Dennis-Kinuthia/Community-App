"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EventsHeaderProps {
  activeTab: "upcoming" | "past"
  onTabChange: (tab: "upcoming" | "past") => void
}

export function EventsHeader({ activeTab, onTabChange }: EventsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Events</h1>
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "upcoming" | "past")}>
        <TabsList className="h-9 bg-[#151A21] border border-[#222836] p-1">
          <TabsTrigger
            value="upcoming"
            className="data-[state=active]:bg-[#222836] data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-1.5 text-sm text-muted-foreground data-[state=active]:text-foreground"
          >
            Upcoming
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="data-[state=active]:bg-[#222836] data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-3 py-1.5 text-sm text-muted-foreground data-[state=active]:text-foreground"
          >
            Past
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

