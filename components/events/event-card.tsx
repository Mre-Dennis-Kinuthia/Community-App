"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Video, MapPin, Clock, Calendar, Loader2 } from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"

interface EventCardProps {
  event: {
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
  onClick?: () => void
  onRegister?: (eventId: number) => void
  isRegistering?: boolean
  activeTab: "upcoming" | "past"
}

const typeColors: Record<string, string> = {
  Webinar: "bg-blue-100 text-blue-700",
  Workshop: "bg-green-100 text-green-700",
  Program: "bg-purple-100 text-purple-700",
  Networking: "bg-orange-100 text-orange-700",
  Hackathon: "bg-pink-100 text-pink-700",
}

const statusColors: Record<string, string> = {
  Open: "bg-primary/10 text-primary border-primary/20",
  Registered: "bg-green-100 text-green-700 border-green-200",
  Invited: "bg-blue-100 text-blue-700 border-blue-200",
  Attended: "bg-gray-100 text-gray-700 border-gray-200",
  Full: "bg-red-100 text-red-700 border-red-200",
}

export function EventCard({ event, onClick, onRegister, isRegistering = false, activeTab }: EventCardProps) {
  const timeString = format(
    new Date().setHours(parseInt(event.time.split(":")[0]), parseInt(event.time.split(":")[1])),
    "h:mm a"
  )
  const endTimeString = event.endTime
    ? format(
        new Date().setHours(parseInt(event.endTime.split(":")[0]), parseInt(event.endTime.split(":")[1])),
        "h:mm a"
      )
    : null

  const dateLabel = isToday(event.date)
    ? "Today"
    : isTomorrow(event.date)
      ? "Tomorrow"
      : format(event.date, "MMM d, yyyy")

  const canRegister = activeTab === "upcoming" && event.status === "Open" && event.capacity && (event.registered || 0) < event.capacity
  const isFull = event.capacity && event.registered && event.registered >= event.capacity

  return (
    <Card
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col gap-4 border-border/50 p-4 transition-all hover:shadow-card hover:scale-[1.01] sm:flex-row"
    >
      {/* Event content */}
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className={typeColors[event.type] || "bg-gray-100 text-gray-700"}>
                {event.type}
              </Badge>
              <Badge
                variant="secondary"
                className={statusColors[event.status] || "bg-primary/10 text-primary border-primary/20"}
              >
                {event.status}
              </Badge>
              {isFull && <Badge variant="destructive">Full</Badge>}
            </div>
            <h3 className="text-base font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
              {event.title}
            </h3>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{dateLabel}</span>
            <span className="mx-1">•</span>
            <Clock className="h-3.5 w-3.5" />
            <span>
              {timeString}
              {endTimeString && ` - ${endTimeString}`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>By {event.organizer}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {event.platform === "Google Meet" || event.platform.includes("Meet") || event.platform.includes("Zoom") ? (
                <Video className="h-3.5 w-3.5" />
              ) : (
                <MapPin className="h-3.5 w-3.5" />
              )}
              <span>{event.platform}</span>
            </div>
            {event.capacity && (
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {event.registered || 0}/{event.capacity} registered
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {activeTab === "upcoming" && (
          <div className="flex items-center gap-2 pt-2">
            {canRegister && onRegister && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onRegister(event.id)
                }}
                disabled={isRegistering}
                className="button-press"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Now"
                )}
              </Button>
            )}
            {event.status === "Registered" && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                ✓ Registered
              </Badge>
            )}
            {isFull && event.status !== "Registered" && (
              <Button size="sm" variant="outline" disabled>
                Waitlist
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail */}
      {event.thumbnail && (
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border/50 sm:h-24 sm:w-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.thumbnail}
            alt={event.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </Card>
  )
}
