/* eslint-disable @next/next/no-img-element */
"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  ExternalLink,
  Globe,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Ticket,
  UserPlus,
  Users,
} from "lucide-react"
import {
  eventTimezone,
  formatEventDate,
  formatEventGmtOffset,
  formatEventStartsIn,
  formatEventTime,
} from "@/lib/event-datetime"
import { displayLocation, eventTypeLabel, resolveEventPlatform } from "@/lib/event-constants"
import { ImpactHubMark } from "@/components/brand/impact-hub-mark"
import { EventSharePanel } from "@/components/events/event-share-panel"
import { EventCalendarActions } from "@/components/events/event-calendar-actions"
import { LumaRegistration } from "@/components/events/luma-registration"
import { EventVenueMap } from "@/components/events/event-venue-map"
import { EventFlyer } from "@/components/events/event-flyer"
import { EventDescription } from "@/components/events/event-description"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { HUB_PUBLIC_EMAIL } from "@/lib/hub-contact"
import { getEventPublicPath, getEventPublicUrl, getEventShareText } from "@/lib/event-url"
import { getGoogleMapsOpenUrl } from "@/lib/google-maps"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import type { EventCalendarLinks } from "@/lib/event-calendar"

export type PublicEventAttendee = {
  name: string
  image: string | null
}

export type PublicEventData = {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  location: string | null
  locationType?: string | null
  onlineUrl?: string | null
  googleMapsUrl?: string | null
  capacity: number | null
  imageUrl: string | null
  eventType?: string | null
  organizerName?: string | null
  organizerEmail?: string | null
  tags?: string[]
  registrationRequired?: boolean
  waitlistEnabled?: boolean
  confirmedCount?: number
  waitlistCount?: number
  price?: number | null
  currency?: string | null
  slug?: string | null
  shortCode?: string | null
  timezone?: string | null
  registrationProvider?: string | null
  lumaEventUrl?: string | null
  lumaEventId?: string | null
  attendeePreview?: PublicEventAttendee[]
}

type EventPublicViewProps = {
  event: PublicEventData
  isPastEvent: boolean
  isRegistered: boolean
  isWaitlisted: boolean
  isPendingApproval: boolean
  canRegister: boolean
  isLumaEvent: boolean
  registering: boolean
  cancelling: boolean
  registerLabel: string
  priceLabel: string | null
  calendarLinks: EventCalendarLinks | null
  ticket: { qrDataUrl: string; checkInCode: string } | null
  isLoggedIn: boolean
  onRegister: () => void
  onCancel: () => void
  backHref?: string
  backLabel?: string
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function AttendeeAvatar({ name, image }: PublicEventAttendee) {
  const src = getImageDisplayUrl(image || undefined)
  return (
    <div
      className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-[#faf9f6] bg-[#1c395c] text-[11px] font-semibold text-white"
      title={name}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">{initials(name)}</span>
      )}
    </div>
  )
}

function HostAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#812926] font-semibold text-white",
        size === "sm" ? "h-6 w-6 text-[9px]" : "h-10 w-10 text-xs"
      )}
    >
      {initials(name)}
    </div>
  )
}

function StatusCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#edeff2] bg-white p-4 shadow-sm sm:p-5",
        className
      )}
    >
      {children}
    </div>
  )
}

function MetaRow({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode
  title: string
  subtitle?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#edeff2] bg-white text-[#1c395c]">
        {icon}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-[15px] font-semibold leading-tight text-[#0a1f38]">{title}</p>
        {subtitle ? (
          <div className="mt-0.5 text-[13px] leading-snug text-[#1c395c]/75">{subtitle}</div>
        ) : null}
        {action}
      </div>
    </div>
  )
}

function formatAttendeeLine(
  attendees: PublicEventAttendee[],
  total: number
): string {
  if (total === 0) return "Be the first to join"
  const names = attendees.slice(0, 2).map((a) => a.name)
  if (total === 1) return names[0] || "1 guest"
  if (total === 2) return `${names[0]} and ${names[1]}`
  const rest = total - Math.min(2, names.length)
  return `${names.join(", ")} and ${rest} other${rest === 1 ? "" : "s"}`
}

export function EventPublicView({
  event,
  isPastEvent,
  isRegistered,
  isWaitlisted,
  isPendingApproval,
  canRegister,
  isLumaEvent,
  registering,
  cancelling,
  registerLabel,
  priceLabel,
  calendarLinks,
  ticket,
  isLoggedIn,
  onRegister,
  onCancel,
  backHref,
  backLabel = "Events",
}: EventPublicViewProps) {
  const eventTz = eventTimezone(event.timezone)
  const gmt = formatEventGmtOffset(event.startDate, eventTz)
  const confirmedCount = event.confirmedCount ?? 0
  const isFull = event.capacity != null && confirmedCount >= event.capacity
  const registrationRequired = event.registrationRequired !== false
  const platformInfo = resolveEventPlatform({
    locationType: event.locationType,
    onlineUrl: event.onlineUrl,
    location: event.location,
  })
  const attendees = event.attendeePreview ?? []
  const hostName = event.organizerName?.trim() || "Impact Hub Nairobi"
  const hostEmail = event.organizerEmail?.trim() || HUB_PUBLIC_EMAIL
  const goingLabel = isPastEvent
    ? `${confirmedCount} Went`
    : confirmedCount > 0
      ? `${confirmedCount} Going`
      : "Going"

  const timeLine = [
    formatEventTime(event.startDate, eventTz),
    event.endDate ? formatEventTime(event.endDate, eventTz) : null,
  ]
    .filter(Boolean)
    .join(" – ")
  const startsIn = isPastEvent ? null : formatEventStartsIn(event.startDate)
  const weekdayDate = formatEventDate(event.startDate, eventTz, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: undefined,
  })
  const venueName = event.location?.split(",")[0]?.trim() || platformInfo?.label || "Venue"
  const venueAddress = displayLocation(event)
  const directionsUrl = getGoogleMapsOpenUrl({
    location: event.location,
    googleMapsUrl: event.googleMapsUrl,
  })

  const inviteFriend = async () => {
    const url = getEventPublicUrl(event)
    const text = getEventShareText(event.title, event.startDate)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: event.title, text, url })
        return
      } catch {
        // cancelled
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Invite link copied")
    } catch {
      toast.error("Could not copy invite link")
    }
  }

  const statusTitle = isPastEvent
    ? "Thank you for joining"
    : isRegistered
      ? "You're In"
      : isWaitlisted
        ? "You're on the waitlist"
        : isPendingApproval
          ? "Application pending"
          : !registrationRequired
            ? "No registration required"
            : canRegister && isLumaEvent
              ? "Register on Luma"
              : canRegister
                ? isFull && event.waitlistEnabled
                  ? "Join the waitlist"
                  : "Welcome! To join the event, please register below."
                : "Registration is closed"

  const pillBtn =
    "h-9 flex-1 rounded-full border-0 bg-[#f3f4f6] px-3 text-[13px] font-medium text-[#0a1f38] shadow-none hover:bg-[#e8eaee]"

  const ctaBlock = (
    <StatusCard className="space-y-3 overflow-hidden p-0 sm:p-0">
      <div className="space-y-3 px-4 pb-1 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[17px] font-semibold leading-snug text-[#0a1f38]">{statusTitle}</p>
          {startsIn ? (
            <p className="shrink-0 pt-0.5 text-[12px] font-medium text-[#c2410c]">{startsIn}</p>
          ) : null}
        </div>

        {isPastEvent ? (
          <p className="text-[13px] text-[#1c395c]/75">We hope you enjoyed the event.</p>
        ) : isRegistered ? (
          <div className="flex gap-2">
            {calendarLinks ? (
              <Button
                type="button"
                variant="secondary"
                className={pillBtn}
                onClick={() => window.open(calendarLinks.google, "_blank", "noopener,noreferrer")}
              >
                <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                Add to Calendar
              </Button>
            ) : null}
            <Button type="button" variant="secondary" className={pillBtn} onClick={inviteFriend}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Invite a Friend
            </Button>
          </div>
        ) : isWaitlisted ? (
          <p className="text-[13px] text-[#1c395c]/75">We&apos;ll notify you if a spot opens up.</p>
        ) : isPendingApproval ? (
          <p className="text-[13px] text-[#1c395c]/75">The organizer will review your application.</p>
        ) : !registrationRequired ? (
          <p className="text-[13px] text-[#1c395c]/75">Just show up — you&apos;re welcome.</p>
        ) : canRegister && isLumaEvent ? (
          <LumaRegistration event={event} />
        ) : canRegister ? (
          <div className="space-y-2.5">
            {priceLabel ? (
              <p className="text-sm font-medium text-[#812926]">{priceLabel}</p>
            ) : null}
            <Button
              className="h-11 w-full rounded-xl bg-[#0a1f38] text-[15px] font-semibold text-white hover:bg-[#0a1f38]/90"
              onClick={onRegister}
              disabled={registering}
            >
              {registering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Working…
                </>
              ) : (
                registerLabel
              )}
            </Button>
            {!isLoggedIn && !isLumaEvent && (
              <p className="text-center text-[12px] text-[#1c395c]/70">
                <Link
                  href={`/login?redirect=${encodeURIComponent(getEventPublicPath(event))}`}
                  className="underline underline-offset-2"
                >
                  Log in
                </Link>{" "}
                to register
              </p>
            )}
          </div>
        ) : (
          <p className="text-[13px] text-[#1c395c]/75">Registration is closed for this event.</p>
        )}

        {(isRegistered || isWaitlisted || isPendingApproval) && !isPastEvent ? (
          <p className="text-[12px] leading-relaxed text-[#1c395c]/70">
            {isRegistered ? (
              <>
                Need another ticket?{" "}
                <button
                  type="button"
                  className="font-medium text-[#0f766e] underline underline-offset-2"
                  onClick={inviteFriend}
                >
                  Invite a friend
                </button>
                {" · "}
              </>
            ) : null}
            <button
              type="button"
              className="font-medium text-[#0f766e] underline underline-offset-2 disabled:opacity-50"
              onClick={onCancel}
              disabled={cancelling}
            >
              {cancelling
                ? "Cancelling…"
                : isPendingApproval
                  ? "Withdraw application"
                  : isWaitlisted
                    ? "Leave waitlist"
                    : "Cancel registration"}
            </button>
          </p>
        ) : null}
      </div>

      {event.capacity != null && !isPastEvent ? (
        <div className="space-y-1.5 border-t border-[#edeff2] px-4 py-3 sm:px-5">
          <div className="flex justify-between text-[11px] text-[#1c395c]/70">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {confirmedCount} / {event.capacity} spots
            </span>
            {(event.waitlistCount ?? 0) > 0 && (
              <span>{event.waitlistCount} waitlisted</span>
            )}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[#edeff2]">
            <div
              className="h-full rounded-full bg-[#812926] transition-all"
              style={{
                width: `${Math.min(100, (confirmedCount / event.capacity) * 100)}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      {isRegistered && !isPastEvent ? (
        <div className="flex items-center justify-between gap-2 border-t border-[#edeff2] bg-[#f7f8fa] px-4 py-2.5 text-[12px] text-[#1c395c]/80 sm:px-5">
          <span className="font-medium text-[#0a1f38]">Get Ready for the Event</span>
          <span className="truncate text-[#1c395c]/60">
            {ticket ? "Ticket ready" : "Reminder email"}
          </span>
        </div>
      ) : null}
    </StatusCard>
  )

  const hostBlock = (
    <div className="space-y-5 lg:space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#1c395c]/50">Hosted By</p>
        <div className="mt-2.5 flex items-center gap-3">
          <ImpactHubMark size={32} title="Impact Hub Nairobi" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#0a1f38]">Impact Hub Nairobi</p>
            <div className="mt-1 flex items-center gap-2">
              <a
                href="https://www.linkedin.com/company/impact-hub-nairobi"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[#edeff2] bg-white p-1.5 text-[#1c395c] hover:bg-[#edeff2]"
                aria-label="Impact Hub Nairobi on LinkedIn"
              >
                <Linkedin className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://nairobi.impacthub.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[#edeff2] bg-white p-1.5 text-[#1c395c] hover:bg-[#edeff2]"
                aria-label="Impact Hub Nairobi website"
              >
                <Globe className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {hostName !== "Impact Hub Nairobi" ? (
        <div className="flex items-center gap-3">
          <HostAvatar name={hostName} />
          <p className="text-sm font-medium text-[#0a1f38]">{hostName}</p>
        </div>
      ) : null}

      <div>
        <p className="text-sm font-semibold text-[#0a1f38]">{goingLabel}</p>
        {attendees.length > 0 ? (
          <>
            <div className="mt-2.5 flex items-center">
              {attendees.slice(0, 6).map((person, index) => (
                <div
                  key={`${person.name}-${index}`}
                  className={cn(index > 0 && "-ml-2")}
                  style={{ zIndex: 6 - index }}
                >
                  <AttendeeAvatar {...person} />
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-[#1c395c]/80">
              {formatAttendeeLine(attendees, confirmedCount)}
            </p>
          </>
        ) : (
          <p className="mt-1.5 text-[13px] text-[#1c395c]/70">
            {isPastEvent ? "No public guest list for this event." : "No one has registered yet."}
          </p>
        )}
      </div>

      <a
        href={`mailto:${hostEmail}?subject=${encodeURIComponent(`Question about ${event.title}`)}`}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#812926] underline underline-offset-4"
      >
        <Mail className="h-3.5 w-3.5" />
        Contact the Host
      </a>
    </div>
  )

  const flyer = (
    <EventFlyer src={event.imageUrl} alt={`${event.title} flyer`} variant="detail" />
  )

  const headerBlock = (
    <header className="space-y-3.5 sm:space-y-5">
      <div className="flex flex-wrap gap-1.5">
        {event.eventType ? (
          <span className="rounded-full border border-border bg-white/70 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {eventTypeLabel(event.eventType)}
          </span>
        ) : null}
        {isPastEvent ? (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
            Past event
          </span>
        ) : null}
        {priceLabel ? (
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground">
            {priceLabel}
          </span>
        ) : null}
      </div>

      <h1 className="break-words text-[1.5rem] font-semibold leading-snug tracking-tight text-[#0a1f38] sm:text-3xl lg:text-4xl lg:font-medium lg:font-serif">
        {event.title}
      </h1>

      <div className="flex items-center gap-2 text-[13px] text-[#1c395c]/80">
        <HostAvatar name={hostName} size="sm" />
        <p>
          Hosted by <span className="font-medium text-[#0a1f38]">{hostName}</span>
        </p>
      </div>

      <div className="space-y-3">
        <MetaRow
          icon={<Calendar className="h-4 w-4" />}
          title={weekdayDate}
          subtitle={
            <>
              {timeLine}
              {gmt ? ` ${gmt}` : ""}
            </>
          }
        />

        {event.location || event.onlineUrl || platformInfo ? (
          <MetaRow
            icon={<MapPin className="h-4 w-4" />}
            title={venueName}
            subtitle={
              venueAddress && venueAddress !== venueName ? venueAddress : undefined
            }
            action={
              <>
                {directionsUrl && event.locationType !== "online" ? (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-[#0f766e] hover:underline"
                  >
                    Get Directions
                  </a>
                ) : null}
                {event.onlineUrl && event.locationType !== "in-person" ? (
                  <a
                    href={event.onlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[13px] text-[#812926] hover:underline"
                  >
                    Join online <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </>
            }
          />
        ) : null}
      </div>
    </header>
  )

  const detailsBlock = (
    <>
      {event.description ? (
        <section className="w-full min-w-0 space-y-3 overflow-x-clip">
          <h2 className="text-[15px] font-semibold text-[#0a1f38]">About Event</h2>
          <EventDescription html={event.description} className="text-[14px] leading-relaxed sm:text-[15px]" />
        </section>
      ) : null}

      {event.location && event.locationType !== "online" ? (
        <section className="space-y-2.5">
          <h2 className="text-[15px] font-semibold text-[#0a1f38]">Location</h2>
          <div>
            <p className="text-[15px] font-semibold text-[#0a1f38]">{venueName}</p>
            {venueAddress && venueAddress !== venueName ? (
              <p className="mt-0.5 text-[13px] text-[#1c395c]/80">{venueAddress}</p>
            ) : null}
          </div>
          <EventVenueMap
            location={event.location}
            locationType={event.locationType}
            googleMapsUrl={event.googleMapsUrl}
            compact
            className="max-w-none rounded-xl sm:max-w-lg"
          />
        </section>
      ) : (
        <EventVenueMap
          location={event.location}
          locationType={event.locationType}
          googleMapsUrl={event.googleMapsUrl}
          compact
        />
      )}

      {isLumaEvent && event.lumaEventUrl && !canRegister ? (
        <section className="rounded-2xl border border-border bg-card p-4">
          <LumaRegistration event={event} />
        </section>
      ) : null}

      {isRegistered && ticket ? (
        <section className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 sm:gap-4 sm:p-4">
          <img
            src={ticket.qrDataUrl}
            alt="Check-in QR code"
            className="h-24 w-24 rounded-lg border bg-white sm:h-36 sm:w-40"
          />
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Your ticket</h2>
            </div>
            <p className="text-[13px] text-muted-foreground">Show this QR at check-in</p>
            <p className="mt-1.5 font-mono text-sm tracking-widest">{ticket.checkInCode}</p>
          </div>
        </section>
      ) : null}

      {isRegistered && calendarLinks ? (
        <section className="hidden space-y-3 rounded-2xl border border-border bg-card p-4 sm:block">
          <h2 className="text-sm font-semibold">On your calendar</h2>
          <p className="text-sm text-muted-foreground">
            A calendar invite was sent when you registered. Use these options if you need to add
            it again.
          </p>
          <EventCalendarActions links={calendarLinks} />
        </section>
      ) : null}

      <div className="hidden sm:block">
        <EventSharePanel
          event={{
            id: event.id,
            title: event.title,
            startDate: event.startDate,
            slug: event.slug,
            shortCode: event.shortCode,
          }}
        />
      </div>

      {event.tags && event.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/80 px-2.5 py-1 text-[12px] text-[#1c395c]/75"
            >
              # {tag}
            </span>
          ))}
        </div>
      ) : null}
    </>
  )

  return (
    <article className="w-full min-w-0 max-w-full px-4 pb-8 pt-3 sm:px-6 sm:pb-10 sm:pt-6">
      <div className="mx-auto max-w-5xl">
        {backHref ? (
          <Button variant="ghost" size="sm" className="-ml-2 mb-3 h-8 gap-2 px-2 text-[#1c395c] sm:mb-5" asChild>
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4 shrink-0" />
              {backLabel}
            </Link>
          </Button>
        ) : null}

        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] lg:items-start lg:gap-x-12 lg:gap-y-6">
          <div className="order-1 lg:sticky lg:top-20 lg:col-start-1 lg:row-span-4 lg:self-start lg:space-y-6">
            {flyer}
            <div className="hidden lg:block">{hostBlock}</div>
          </div>
          <div className="order-2 min-w-0 lg:col-start-2">{headerBlock}</div>
          <div className="order-3 min-w-0 lg:col-start-2">{ctaBlock}</div>
          <div className="order-4 min-w-0 space-y-6 lg:col-start-2 lg:space-y-8">{detailsBlock}</div>
          <aside className="order-5 border-t border-[#edeff2]/80 pt-5 lg:hidden">
            {hostBlock}
          </aside>
        </div>
      </div>
    </article>
  )
}
