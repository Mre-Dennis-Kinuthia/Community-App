"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Video, MapPin, Clock, Calendar, Loader2, Share2, ExternalLink } from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import Link from "next/link"
import { toast } from "@/lib/toast"
import { badgeClassForLabel, badgePrimary, badgeNeutral, badgeDestructive } from "@/lib/badge-styles"
import { cn } from "@/lib/utils"
import { getEventPublicUrl, getEventShareText } from "@/lib/event-url"

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
    waitlistEnabled?: boolean
    registrationDeadline?: Date
    waitlistEnabled?: boolean
    priceLabel?: string | null
  }
  onClick?: () => void
  onRegister?: (eventId: number) => void
  isRegistering?: boolean
  activeTab: "upcoming" | "past"
}

const statusColors: Record<string, string> = {
  Open: badgePrimary,
  Registered: badgeNeutral,
  Invited: badgeNeutral,
  Attended: badgeNeutral,
  Full: badgeDestructive,
}

export function EventCard({ event, onClick, onRegister, isRegistering = false, activeTab }: EventCardProps) {
  const eventPageUrl = `/events/${event.id}`
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

  const isFull =
    event.capacity != null && (event.registered ?? 0) >= event.capacity
  const canRegister =
    activeTab === "upcoming" &&
    (event.status === "Open" || (isFull && event.waitlistEnabled)) &&
    event.status !== "Registered" &&
    event.status !== "Waitlisted" &&
    event.status !== "Attended" &&
    (!isFull || event.waitlistEnabled)
  const eventUrl = getEventPublicUrl(String(event.id))
  const shareText = getEventShareText(event.title, event.date)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: shareText, url: eventUrl })
        return
      } catch {
        // cancelled
      }
    }
    try {
      await navigator.clipboard.writeText(eventUrl)
      toast.success("Event link copied to clipboard.")
    } catch {
      toast.error("Could not copy link")
    }
  }

  return (
    <Card
      onClick={onClick}
      className="relative flex cursor-pointer flex-col gap-4 border-border p-[1.15rem] transition-colors rounded-lg md:flex-row md:items-stretch hover:border-foreground/20"
    >
      {/* Thumbnail (if available) */}
      {event.thumbnail && (
        <div className="w-full md:w-40 lg:w-44 shrink-0 overflow-hidden rounded-md bg-muted">
          <div className="aspect-[4/3] w-full h-full">
            <img
              src={event.thumbnail}
              alt={event.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Event content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <Badge className={cn(badgeClassForLabel(event.type), "text-xs")}>
                {event.type}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(statusColors[event.status] || badgePrimary, "text-xs border")}
              >
                {event.status}
              </Badge>
              {isFull && (
                <Badge variant="destructive" className="text-xs">
                  Full
                </Badge>
              )}
            </div>
            <h3 className="line-clamp-2 break-words text-sm font-semibold leading-snug text-foreground">
              <Link
                href={eventPageUrl}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline underline-offset-2"
              >
                {event.title}
              </Link>
            </h3>
            {event.priceLabel && (
              <p className="text-xs font-medium text-foreground mt-0.5">{event.priceLabel}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
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

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
                className=""
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
              <Badge variant="secondary" className={cn(badgePrimary, "border")}>
                ✓ Registered
              </Badge>
            )}
            {isFull && event.status !== "Registered" && (
              <Button size="sm" variant="outline" disabled>
                Waitlist
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={eventPageUrl}>
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                View
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                handleShare()
              }}
              className="gap-1"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
