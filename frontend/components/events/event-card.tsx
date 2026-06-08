"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Clock, Loader2, Share2, ExternalLink } from "lucide-react"
import { EventPlatformBadge } from "@/components/platform-icon"
import { format, isToday, isTomorrow } from "date-fns"
import Link from "next/link"
import { toast } from "@/lib/toast"
import { badgeClassForLabel, badgePrimary, badgeNeutral, badgeDestructive } from "@/lib/badge-styles"
import { cn } from "@/lib/utils"
import { getEventPublicUrl, getEventShareText } from "@/lib/event-url"

interface EventCardProps {
  event: {
    id: number | string
    title: string
    type: string
    category: string
    time: string
    endTime?: string
    organizer: string
    platform: string
    platformIcon?: string
    status: string
    thumbnail?: string
    date: Date
    capacity?: number
    registered?: number
    waitlistEnabled?: boolean
    priceLabel?: string | null
    slug?: string
    shortCode?: string
    registrationProvider?: string | null
    lumaEventUrl?: string | null
  }
  onClick?: () => void
  onRegister?: (eventId: number | string) => void
  isRegistering?: boolean
  activeTab: "upcoming" | "past"
}

const statusColors: Record<string, string> = {
  Open: badgePrimary,
  Registered: badgeNeutral,
  Pending: "bg-violet-100 text-violet-800 border-violet-200",
  Waitlisted: "bg-amber-100 text-amber-800 border-amber-200",
  Invited: badgeNeutral,
  Attended: badgeNeutral,
  Full: badgeDestructive,
}

export function EventCard({
  event,
  onClick,
  onRegister,
  isRegistering = false,
  activeTab,
}: EventCardProps) {
  const eventPageUrl = `/events/${event.id}`
  const formatClock = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number)
    const d = new Date()
    d.setHours(h, m, 0, 0)
    return format(d, "h:mm a")
  }
  const timeString = formatClock(event.time)
  const endTimeString = event.endTime ? formatClock(event.endTime) : null

  const dateLabel = isToday(event.date)
    ? "Today"
    : isTomorrow(event.date)
      ? "Tomorrow"
      : format(event.date, "MMM d")

  const dayNum = format(event.date, "d")
  const monthShort = format(event.date, "MMM").toUpperCase()

  const isFull =
    event.capacity != null && (event.registered ?? 0) >= event.capacity
  const canRegister =
    activeTab === "upcoming" &&
    (event.status === "Open" || (isFull && event.waitlistEnabled)) &&
    event.status !== "Registered" &&
    event.status !== "Waitlisted" &&
    event.status !== "Pending" &&
    event.status !== "Attended" &&
    (!isFull || event.waitlistEnabled)

  const registerLabel =
    event.registrationProvider === "luma"
      ? "Luma"
      : isFull && event.waitlistEnabled
        ? "Waitlist"
        : "Register"

  const eventUrl = getEventPublicUrl({
    id: String(event.id),
    shortCode: event.shortCode,
    slug: event.slug,
  })
  const shareText = getEventShareText(event.title, event.date)

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
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

  const statusBadge = (
    <Badge
      variant="secondary"
      className={cn(statusColors[event.status] || badgePrimary, "text-[10px] border px-2 py-0")}
    >
      {event.status}
    </Badge>
  )

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer overflow-hidden rounded-xl border-border/80 transition-colors",
        "hover:border-foreground/15 hover:bg-muted/20",
        onClick && "active:bg-muted/30"
      )}
    >
      {/* Mobile: compact row (Hub-style date column + info) */}
      <div className="flex gap-0 md:hidden">
        <div className="flex w-[4.5rem] shrink-0 flex-col items-center justify-center border-r border-border/60 bg-muted/20 py-4">
          <span className="text-2xl font-semibold leading-none tracking-tight">{dayNum}</span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {monthShort}
          </span>
        </div>
        <div className="min-w-0 flex-1 p-3.5">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            {statusBadge}
            {event.priceLabel && (
              <span className="text-[10px] font-medium text-muted-foreground">{event.priceLabel}</span>
            )}
          </div>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">
            <Link href={eventPageUrl} onClick={(e) => e.stopPropagation()} className="hover:underline">
              {event.title}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {timeString}
            {endTimeString ? ` – ${endTimeString}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {event.platformIcon ? (
              <EventPlatformBadge icon={event.platformIcon} label={event.platform} size={14} />
            ) : (
              <span className="truncate">{event.platform}</span>
            )}
          </p>
          <div
            className="mt-3 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {activeTab === "upcoming" && canRegister && onRegister && (
              <Button
                size="sm"
                className="h-8 rounded-lg px-3 text-xs"
                onClick={() => onRegister(event.id)}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  registerLabel
                )}
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-8 rounded-lg px-3 text-xs" asChild>
              <Link href={eventPageUrl}>View</Link>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="ml-auto h-8 w-8 shrink-0"
              onClick={handleShare}
              aria-label="Share event"
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop: card layout */}
      <div className="hidden md:flex md:flex-col">
        {event.thumbnail && (
          <div className="w-full shrink-0 overflow-hidden bg-muted">
            <div className="aspect-[16/9] w-full">
              <img
                src={event.thumbnail}
                alt=""
                className="h-full w-full object-contain object-center"
                loading="lazy"
              />
            </div>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge className={cn(badgeClassForLabel(event.type), "text-xs")}>
                {event.type}
              </Badge>
              {statusBadge}
              {isFull && event.status === "Open" && (
                <Badge variant="destructive" className="text-xs">
                  Full
                </Badge>
              )}
            </div>

            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              <Link
                href={eventPageUrl}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline underline-offset-2"
              >
                {event.title}
              </Link>
            </h3>

            {event.priceLabel && (
              <p className="text-xs font-medium text-foreground">{event.priceLabel}</p>
            )}

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>{dateLabel}</span>
                <span className="text-muted-foreground/50">·</span>
                <span>
                  {timeString}
                  {endTimeString && ` – ${endTimeString}`}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  {event.organizer}
                </span>
                <span className="inline-flex items-center gap-1.5 min-w-0">
                  {event.platformIcon ? (
                    <EventPlatformBadge icon={event.platformIcon} label={event.platform} size={16} />
                  ) : (
                    event.platform
                  )}
                </span>
                {event.capacity != null && (
                  <span className="inline-flex items-center gap-1.5">
                    {event.registered ?? 0}/{event.capacity} spots
                  </span>
                )}
              </div>
            </div>
          </div>

          <div
            className="mt-auto flex w-full min-w-0 flex-wrap gap-2 border-t border-border pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            {activeTab === "upcoming" && canRegister && onRegister && (
              <Button
                size="sm"
                className="min-w-0 flex-1 sm:flex-none"
                onClick={() => onRegister(event.id)}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isFull && event.waitlistEnabled ? "Joining..." : "Registering..."}
                  </>
                ) : (
                  registerLabel
                )}
              </Button>
            )}

            {activeTab === "upcoming" && event.status === "Registered" && (
              <Badge variant="secondary" className={cn(badgePrimary, "border px-3 py-1.5")}>
                ✓ Registered
              </Badge>
            )}

            {activeTab === "upcoming" && event.status === "Waitlisted" && (
              <Badge variant="secondary" className="border px-3 py-1.5 bg-amber-50 text-amber-900">
                On waitlist
              </Badge>
            )}

            {activeTab === "upcoming" && event.status === "Pending" && (
              <Badge variant="secondary" className="border px-3 py-1.5 bg-violet-50 text-violet-900">
                Pending approval
              </Badge>
            )}

            {activeTab === "upcoming" &&
              isFull &&
              !event.waitlistEnabled &&
              event.status === "Full" && (
                <Button size="sm" variant="outline" disabled className="flex-1 sm:flex-none">
                  Event full
                </Button>
              )}

            <Button size="sm" variant="outline" className="flex-1 sm:flex-none" asChild>
              <Link href={eventPageUrl}>
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                View
              </Link>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="flex-1 sm:flex-none gap-1"
              onClick={handleShare}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
