"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Video, Loader2, ExternalLink, Mail } from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import Link from "next/link"
import { badgeClassForLabel } from "@/lib/badge-styles"
import { cn } from "@/lib/utils"
import { EventSharePanel } from "@/components/events/event-share-panel"

interface EventDetailSheetProps {
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
    description: string
    speakers?: string[]
    tags: string[]
    capacity?: number
    registered?: number
    waitlistEnabled?: boolean
    registrationDeadline?: Date
    priceLabel?: string | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegister?: (eventId: number) => void
  isRegistering?: boolean
}

export function EventDetailSheet({
  event,
  open,
  onOpenChange,
  onRegister,
  isRegistering = false,
}: EventDetailSheetProps) {
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
      : format(event.date, "EEEE, MMM d, yyyy")

  const isFull =
    event.capacity != null && (event.registered ?? 0) >= event.capacity
  const canRegister =
    (event.status === "Open" || (isFull && event.waitlistEnabled)) &&
    event.status !== "Registered" &&
    event.status !== "Waitlisted" &&
    event.status !== "Attended"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {/* Image Header */}
        {event.thumbnail && (
          <div className="relative -mx-6 -mt-6 h-48 overflow-hidden border-b">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.thumbnail}
              alt={event.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <SheetHeader className={event.thumbnail ? "pt-4" : ""}>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className={cn(badgeClassForLabel(event.type), "border")}>
              {event.type}
            </Badge>
            <Badge variant="secondary" className="text-xs">{event.category}</Badge>
            <Badge
              variant="secondary"
              className={
                event.status === "Open"
                  ? "bg-primary/10 text-primary text-xs"
                  : event.status === "Registered"
                    ? "bg-green-100 text-green-700 text-xs"
                    : "bg-gray-100 text-gray-700 text-xs"
              }
            >
              {event.status}
            </Badge>
            {isFull && <Badge variant="destructive" className="text-xs">Full</Badge>}
          </div>
          <SheetTitle className="text-xl leading-tight">{event.title}</SheetTitle>
          <SheetDescription className="text-sm mt-1">
            {event.organizer}
            {event.priceLabel && (
              <span className="block font-semibold text-foreground mt-1">{event.priceLabel}</span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium truncate">{dateLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-medium">
                  {timeString}
                  {endTimeString && ` - ${endTimeString}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {event.platform === "Google Meet" || event.platform.includes("Meet") || event.platform.includes("Zoom") ? (
                <Video className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Platform</p>
                <p className="text-sm font-medium truncate">{event.platform}</p>
              </div>
            </div>
            {event.capacity && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Capacity</p>
                  <p className="text-sm font-medium">
                    {event.registered || 0}/{event.capacity}
                    {!isFull && ` (${event.capacity - (event.registered || 0)} left)`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-sm mb-2">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
          </div>

          {/* Speakers & Tags Row */}
          {(event.speakers?.length > 0 || event.tags?.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {event.speakers && event.speakers.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Speakers</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {event.speakers.map((speaker, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {speaker}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {event.tags && event.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Registration Deadline */}
          {event.registrationDeadline && (
            <div className="rounded-lg border border-border bg-amber-50 dark:bg-amber-950/20 p-3">
              <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-0.5">Registration Deadline</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {format(event.registrationDeadline, "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="default" className="w-full" size="lg" asChild>
              <Link href={eventPageUrl}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open event page
              </Link>
            </Button>
            {canRegister && onRegister && (
              <Button
                onClick={() => onRegister(event.id)}
                disabled={isRegistering}
                className="w-full"
                size="lg"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : isFull && event.waitlistEnabled ? (
                  <>
                    Join waitlist
                    <Users className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Register Now
                    <Users className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
            {event.status === "Registered" && (
              <Button variant="outline" className="w-full" disabled size="lg">
                ✓ Registered
              </Button>
            )}
            {event.status === "Waitlisted" && (
              <Button variant="outline" className="w-full" disabled size="lg">
                On waitlist
              </Button>
            )}
            {isFull && event.status !== "Registered" && event.status !== "Waitlisted" && !event.waitlistEnabled && (
              <Button variant="outline" className="w-full" disabled size="lg">
                Event full
              </Button>
            )}
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="w-full" asChild size="sm">
                <a href={`mailto:${event.organizer}?subject=${encodeURIComponent(event.title)}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Contact organizer
                </a>
              </Button>
              {(event.platform === "Google Meet" || event.platform.includes("Meet")) && (
                <Button variant="outline" className="w-full" asChild size="sm">
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Join online
                  </a>
                </Button>
              )}
            </div>

            <EventSharePanel
              eventId={String(event.id)}
              eventTitle={event.title}
              startDate={event.date}
              variant="inline"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

