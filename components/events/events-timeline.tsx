"use client"

import { TimelineDate } from "./timeline-date"
import { EventCard } from "./event-card"
import { useMemo } from "react"

interface Event {
  id: number
  title: string
  time: string
  organizer: string
  platform: string
  status: string
  thumbnail?: string
  date: Date
}

interface EventsTimelineProps {
  events: Event[]
  onEventClick?: (event: Event) => void
}

export function EventsTimeline({ events, onEventClick }: EventsTimelineProps) {
  // Group events by date
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
      return new Date(b).getTime() - new Date(a).getTime() // Most recent first
    })

    return sortedDates.map((dateKey) => ({
      date: new Date(dateKey),
      events: grouped[dateKey],
    }))
  }, [events])

  if (eventsByDate.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">No events found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {events.length === 0 
            ? "You don't have any events yet. Check back soon for upcoming events and programs." 
            : "Try adjusting your filters to see more events."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      {/* Timeline column */}
      <div className="flex-shrink-0 md:w-48">
        <div className="space-y-0">
          {eventsByDate.map((group, index) => (
            <TimelineDate
              key={group.date.toISOString()}
              date={group.date}
              isFirst={index === 0}
              isLast={index === eventsByDate.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Events column */}
      <div className="flex-1 space-y-6 min-w-0">
        {eventsByDate.map((group) => (
          <div key={group.date.toISOString()} className="space-y-4">
            {group.events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onEventClick?.(event)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

