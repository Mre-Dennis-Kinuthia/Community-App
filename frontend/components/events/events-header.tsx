"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EventsHeaderProps {
  activeTab: "upcoming" | "past"
  onTabChange: (tab: "upcoming" | "past") => void
}

export function EventsHeader({ activeTab, onTabChange }: EventsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Events & Programs</h1>
        <p className="text-muted-foreground text-sm">
          Discover workshops, networking events, and programs to accelerate your social impact journey.
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as "upcoming" | "past")}>
        <TabsList className="h-9 bg-muted p-1">
          <TabsTrigger
            value="upcoming"
            className="rounded-md px-3 py-1.5 text-sm"
          >
            Upcoming
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="rounded-md px-3 py-1.5 text-sm"
          >
            Past
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

