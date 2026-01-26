"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Video, MapPin, Clock, Calendar, Loader2, Share2, Facebook, Twitter, Linkedin, Copy } from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import { useState, useEffect, useRef } from "react"

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
  Webinar: "bg-chart-2/20 text-chart-2",
  Workshop: "bg-chart-3/20 text-chart-3",
  Program: "bg-primary/10 text-primary",
  Networking: "bg-chart-4/20 text-chart-4",
  Hackathon: "bg-chart-5/20 text-chart-5",
}

const statusColors: Record<string, string> = {
  Open: "bg-primary/10 text-primary border-primary/20",
  Registered: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  Invited: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  Attended: "bg-muted text-muted-foreground border-border",
  Full: "bg-destructive/10 text-destructive border-destructive/20",
}

const statusBorderHoverColors: Record<string, string> = {
  Open: "hover:border-primary",
  Registered: "hover:border-green-500",
  Invited: "hover:border-blue-500",
  Attended: "hover:border-gray-500",
  Full: "hover:border-red-500",
}

export function EventCard({ event, onClick, onRegister, isRegistering = false, activeTab }: EventCardProps) {
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
      : format(event.date, "MMM d, yyyy")

  const canRegister = activeTab === "upcoming" && event.status === "Open" && event.capacity && (event.registered || 0) < event.capacity
  const isFull = event.capacity && event.registered && event.registered >= event.capacity
  const hoverBorderColor = statusBorderHoverColors[event.status] || "hover:border-primary"

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
    <Card
      onClick={onClick}
      className={`relative flex cursor-pointer flex-row gap-4 border-border/50 p-[1.15rem] transition-colors rounded-md ${hoverBorderColor}`}
    >
      {/* Event content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <Badge className={`${typeColors[event.type] || "bg-gray-100 text-gray-700"} text-xs`}>
                {event.type}
              </Badge>
              <Badge
                variant="secondary"
                className={`${statusColors[event.status] || "bg-primary/10 text-primary border-primary/20"} text-xs`}
              >
                {event.status}
              </Badge>
              {isFull && <Badge variant="destructive" className="text-xs">Full</Badge>}
            </div>
            <h3 className="text-sm font-semibold leading-tight text-foreground">
              {event.title}
            </h3>
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
            <div className="relative" ref={shareMenuRef}>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowShareMenu(!showShareMenu)
                }}
                className="gap-1"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
              {showShareMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-48 rounded-md border bg-background p-2 shadow-lg z-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare("native")
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md"
                  >
                    <Share2 className="h-4 w-4" />
                    Share via...
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare("copy")
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare("facebook")
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare("twitter")
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare("linkedin")
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail */}
      {event.thumbnail && (
        <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg border border-border/50">
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
