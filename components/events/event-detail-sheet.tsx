"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Users, Video, Loader2, ExternalLink, Mail } from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"

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
    registrationDeadline?: Date
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegister?: (eventId: number) => void
  isRegistering?: boolean
}

const typeColors: Record<string, string> = {
  Webinar: "bg-blue-100 text-blue-700",
  Workshop: "bg-green-100 text-green-700",
  Program: "bg-purple-100 text-purple-700",
  Networking: "bg-orange-100 text-orange-700",
  Hackathon: "bg-pink-100 text-pink-700",
}

export function EventDetailSheet({
  event,
  open,
  onOpenChange,
  onRegister,
  isRegistering = false,
}: EventDetailSheetProps) {
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

  const canRegister = event.status === "Open" && event.capacity && (event.registered || 0) < event.capacity
  const isFull = event.capacity && event.registered && event.registered >= event.capacity

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className={typeColors[event.type] || "bg-gray-100 text-gray-700"}>
                  {event.type}
                </Badge>
                <Badge variant="secondary">{event.category}</Badge>
                <Badge
                  variant="secondary"
                  className={
                    event.status === "Open"
                      ? "bg-primary/10 text-primary"
                      : event.status === "Registered"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                  }
                >
                  {event.status}
                </Badge>
                {isFull && <Badge variant="destructive">Full</Badge>}
              </div>
              <SheetTitle className="text-2xl">{event.title}</SheetTitle>
              <SheetDescription className="text-base mt-2">{event.organizer}</SheetDescription>
            </div>
            {event.thumbnail && (
              <div className="relative h-48 w-48 flex-shrink-0 overflow-hidden rounded-xl border border-border/50">
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
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Event Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{dateLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {timeString}
                {endTimeString && ` - ${endTimeString}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {event.platform === "Google Meet" || event.platform.includes("Meet") || event.platform.includes("Zoom") ? (
                <Video className="h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span>{event.platform}</span>
            </div>
            {event.capacity && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {event.registered || 0} of {event.capacity} registered
                  {!isFull && ` (${event.capacity - (event.registered || 0)} spots available)`}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">About this event</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
          </div>

          {/* Speakers */}
          {event.speakers && event.speakers.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Speakers</h3>
              <div className="flex flex-wrap gap-2">
                {event.speakers.map((speaker, index) => (
                  <Badge key={index} variant="outline">
                    {speaker}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Registration Deadline */}
          {event.registrationDeadline && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">
                Registration deadline: {format(event.registrationDeadline, "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {canRegister && onRegister && (
              <Button
                onClick={() => onRegister(event.id)}
                disabled={isRegistering}
                className="flex-1 button-press"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
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
              <Button variant="outline" className="flex-1" disabled>
                ✓ Registered
              </Button>
            )}
            {isFull && event.status !== "Registered" && (
              <Button variant="outline" className="flex-1" disabled>
                Waitlist
              </Button>
            )}
            <Button variant="outline" className="flex-1" asChild>
              <a href={`mailto:${event.organizer}?subject=${encodeURIComponent(event.title)}`}>
                <Mail className="mr-2 h-4 w-4" />
                Contact Organizer
              </a>
            </Button>
            {(event.platform === "Google Meet" || event.platform.includes("Meet")) && (
              <Button variant="outline" className="flex-1" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Join Meeting
                </a>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

