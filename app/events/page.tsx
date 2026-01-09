"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { EventsHeader } from "@/components/events/events-header"
import { EventsTimeline } from "@/components/events/events-timeline"

// Mock event data
const pastEvents = [
  {
    id: 1,
    title: "Quikk Webinar: API Evolution",
    time: "15:00",
    organizer: "Quikk API",
    platform: "Google Meet",
    status: "Invited",
    date: new Date(2024, 10, 15), // Nov 15, 2024
    thumbnail: "/placeholder.svg",
  },
  {
    id: 2,
    title: "Quikk API Webinar: Auto Commissions",
    time: "16:00",
    organizer: "Quikk API",
    platform: "Google Meet",
    status: "Invited",
    date: new Date(2024, 5, 4), // Jun 4, 2024
    thumbnail: "/placeholder.svg",
  },
  {
    id: 3,
    title: "Memethon Hackerhouse",
    time: "09:00",
    organizer: "Impact Hub Nairobi",
    platform: "Impact Hub Nairobi",
    status: "Attended",
    date: new Date(2024, 4, 17), // May 17, 2024
    thumbnail: "/placeholder.svg",
  },
]

const upcomingEvents = [
  {
    id: 4,
    title: "Social Innovation Bootcamp",
    time: "09:00",
    organizer: "Impact Hub Nairobi",
    platform: "Impact Hub Nairobi",
    status: "Registered",
    date: new Date(2025, 1, 15),
    thumbnail: "/placeholder.svg",
  },
  {
    id: 5,
    title: "Networking Mixer: Climate Solutions",
    time: "18:00",
    organizer: "Impact Hub Nairobi",
    platform: "Ikigai Partnership Space",
    status: "Open",
    date: new Date(2025, 1, 8),
    thumbnail: "/placeholder.svg",
  },
  {
    id: 6,
    title: "Design Thinking Workshop",
    time: "10:00",
    organizer: "Impact Hub Nairobi",
    platform: "Innovation Lab",
    status: "Registered",
    date: new Date(2025, 1, 12),
    thumbnail: "/placeholder.svg",
  },
]

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("past")

  const events = useMemo(() => {
    return activeTab === "past" ? pastEvents : upcomingEvents
  }, [activeTab])

  const handleEventClick = (event: typeof pastEvents[0]) => {
    // Handle event click - could open modal or navigate to detail page
    console.log("Event clicked:", event)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Events & Programs" }]} />
        <div className="mb-8">
          <EventsHeader activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <EventsTimeline events={events} onEventClick={handleEventClick} />
      </div>
    </DashboardLayout>
  )
}
