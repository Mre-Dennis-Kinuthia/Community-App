"use client"

import { Badge } from "@/components/ui/badge"
import { Users, Video, MapPin } from "lucide-react"
import { format } from "date-fns"

interface EventCardProps {
  event: {
    id: number
    title: string
    time: string
    organizer: string
    platform: string
    status: string
    thumbnail?: string
    date: Date
  }
  onClick?: () => void
}

export function EventCard({ event, onClick }: EventCardProps) {
  const timeString = format(new Date().setHours(parseInt(event.time.split(":")[0]), parseInt(event.time.split(":")[1])), "h:mm a")

  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer items-start gap-4 rounded-2xl border border-[#222836] bg-[#151A21] p-4 transition-all hover:border-[#3B82F6]/30 hover:shadow-lg"
    >
      {/* Event content */}
      <div className="flex-1 space-y-3">
        <div className="text-xs text-muted-foreground">{timeString}</div>
        <h3 className="text-base font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>By {event.organizer}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {event.platform === "Google Meet" ? (
              <Video className="h-3.5 w-3.5" />
            ) : (
              <MapPin className="h-3.5 w-3.5" />
            )}
            <span>{event.platform}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20 hover:bg-[#3B82F6]/20"
          >
            {event.status}
          </Badge>
        </div>
      </div>

      {/* Thumbnail */}
      {event.thumbnail && (
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-[#222836]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.thumbnail}
            alt={event.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </div>
  )
}

