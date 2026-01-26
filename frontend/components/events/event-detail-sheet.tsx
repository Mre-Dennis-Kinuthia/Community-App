"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Video, Loader2, ExternalLink, Mail, Share2, Facebook, Twitter, Linkedin, Copy } from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import { useState, useEffect, useRef } from "react"

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
  Webinar: "bg-chart-2/20 text-chart-2",
  Workshop: "bg-chart-3/20 text-chart-3",
  Program: "bg-primary/10 text-primary",
  Networking: "bg-chart-4/20 text-chart-4",
  Hackathon: "bg-chart-5/20 text-chart-5",
}

export function EventDetailSheet({
  event,
  open,
  onOpenChange,
  onRegister,
  isRegistering = false,
}: EventDetailSheetProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const shareMenuRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false)
      }
    }

    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showShareMenu])
  
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

  const eventUrl = typeof window !== "undefined" ? `${window.location.origin}/events/${event.id}` : ""
  const shareText = `Check out this event: ${event.title}`

  const handleShare = async (platform: string) => {
    if (platform === "native" && navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: eventUrl,
        })
        setShowShareMenu(false)
        return
      } catch (error) {
        // User cancelled
      }
    }

    if (platform === "copy") {
      await navigator.clipboard.writeText(eventUrl)
      alert("Event link copied to clipboard!")
      setShowShareMenu(false)
      return
    }

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`,
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400")
      setShowShareMenu(false)
    }
  }

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
            <Badge className={typeColors[event.type] || "bg-gray-100 text-gray-700"}>
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
          <SheetDescription className="text-sm mt-1">{event.organizer}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
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
            <div className="rounded-lg border border-border/50 bg-amber-50 dark:bg-amber-950/20 p-3">
              <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-0.5">Registration Deadline</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {format(event.registrationDeadline, "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            {canRegister && onRegister && (
              <Button
                onClick={() => onRegister(event.id)}
                disabled={isRegistering}
                className="w-full button-press"
                size="lg"
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
              <Button variant="outline" className="w-full" disabled size="lg">
                ✓ Registered
              </Button>
            )}
            {isFull && event.status !== "Registered" && (
              <Button variant="outline" className="w-full" disabled size="lg">
                Waitlist
              </Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full" asChild size="sm">
                <a href={`mailto:${event.organizer}?subject=${encodeURIComponent(event.title)}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </a>
              </Button>
              <div className="relative" ref={shareMenuRef}>
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                {showShareMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 rounded-md border bg-background p-2 shadow-lg z-50">
                    <button
                      onClick={() => handleShare("native")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md"
                    >
                      <Share2 className="h-4 w-4" />
                      Share via...
                    </button>
                    <button
                      onClick={() => handleShare("copy")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </button>
                    <button
                      onClick={() => handleShare("facebook")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </button>
                    <button
                      onClick={() => handleShare("twitter")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </button>
                  </div>
                )}
              </div>
              {(event.platform === "Google Meet" || event.platform.includes("Meet")) && (
                <Button variant="outline" className="w-full col-span-2" asChild size="sm">
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Join
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

