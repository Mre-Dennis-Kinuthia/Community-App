"use client"

import { EventCard } from "./event-card"
import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar as CalendarIcon } from "lucide-react"
import { format, startOfWeek, endOfWeek, isWithinInterval, isToday, isTomorrow } from "date-fns"

interface Event {
  id: number
  title: string
  type: string
  category: string
  time: string
  endTime?: string
  organizer: string
  platform: string
  status: string
  thumbnail?: string
  date: Date
  capacity?: number
  registered?: number
  registrationDeadline?: Date
}

interface EventsTimelineProps {
  events: Event[]
  onEventClick?: (event: Event) => void
  onRegister?: (eventId: number) => void
  registering?: Record<number, boolean>
  activeTab: "upcoming" | "past"
}

export function EventsTimeline({ events, onEventClick, onRegister, registering = {}, activeTab }: EventsTimelineProps) {
  // Group events by date with smart labels
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {}

    events.forEach((event) => {
      const dateKey = event.date.toDateString()
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })

    // Sort dates
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      return activeTab === "past"
        ? new Date(b).getTime() - new Date(a).getTime() // Most recent first for past
        : new Date(a).getTime() - new Date(b).getTime() // Soonest first for upcoming
    })

    return sortedDates.map((dateKey) => ({
      date: new Date(dateKey),
      events: grouped[dateKey],
      label: getDateLabel(new Date(dateKey), activeTab),
    }))
  }, [events, activeTab])

  function getDateLabel(date: Date, tab: "upcoming" | "past"): string {
    if (tab === "upcoming") {
      if (isToday(date)) return "Today"
      if (isTomorrow(date)) return "Tomorrow"
      const today = new Date()
      const weekStart = startOfWeek(today, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
      if (isWithinInterval(date, { start: weekStart, end: weekEnd })) {
        return "This Week"
      }
    }
    return format(date, "MMM yyyy") // Month label for past events
  }

  // Group by month for past events
  const groupedByMonth = useMemo(() => {
    if (activeTab === "past") {
      const months: Record<string, typeof eventsByDate> = {}
      eventsByDate.forEach((group) => {
        const monthKey = format(group.date, "MMMM yyyy")
        if (!months[monthKey]) {
          months[monthKey] = []
        }
        months[monthKey].push(group)
      })
      return Object.entries(months).map(([month, groups]) => ({
        month,
        groups,
      }))
    }
    return null
  }, [eventsByDate, activeTab])

  if (events.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No events found</p>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {activeTab === "past"
              ? "You don't have any past events. Check your upcoming events or browse all available events."
              : "No upcoming events match your filters. Try adjusting your search or check back soon for new events."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {activeTab === "past" && groupedByMonth ? (
        // Past events grouped by month
        groupedByMonth.map((monthGroup) => (
          <div key={monthGroup.month} className="space-y-4">
            <div className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {monthGroup.month}
            </div>
            {monthGroup.groups.map((group) => (
              <div key={group.date.toISOString()} className="space-y-3">
                {group.events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick?.(event)}
                    onRegister={onRegister}
                    isRegistering={registering[event.id]}
                    activeTab={activeTab}
                  />
                ))}
              </div>
            ))}
          </div>
        ))
      ) : (
        // Upcoming events
        eventsByDate.map((group) => (
          <div key={group.date.toISOString()} className="space-y-3">
            {group.events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onEventClick?.(event)}
                onRegister={onRegister}
                isRegistering={registering[event.id]}
                activeTab={activeTab}
              />
            ))}
          </div>
        ))
      )}
    </div>
  )
}
