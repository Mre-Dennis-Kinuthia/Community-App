/* eslint-disable @next/next/no-img-element */
"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ExternalLink,
  Globe,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Ticket,
  Users,
} from "lucide-react"
import {
  eventTimezone,
  formatEventDate,
  formatEventDateBadge,
  formatEventGmtOffset,
  formatEventTime,
} from "@/lib/event-datetime"
import { displayLocation, eventTypeLabel, resolveEventPlatform } from "@/lib/event-constants"
import { EventPlatformBadge } from "@/components/platform-icon"
import { ImpactHubMark } from "@/components/brand/impact-hub-mark"
import { EventSharePanel } from "@/components/events/event-share-panel"
import { EventCalendarActions } from "@/components/events/event-calendar-actions"
import { LumaRegistration } from "@/components/events/luma-registration"
import { EventVenueMap } from "@/components/events/event-venue-map"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { HUB_PUBLIC_EMAIL } from "@/lib/hub-contact"
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

function HostAvatar({ name }: { name: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#812926] text-xs font-semibold text-white">
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
        "rounded-xl border border-[#edeff2] bg-white p-4 shadow-sm",
        className
      )}
    >
      {children}
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
}: EventPublicViewProps) {
  const eventTz = eventTimezone(event.timezone)
  const badge = formatEventDateBadge(event.startDate, eventTz)
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
  const imageSrc = getImageDisplayUrl(event.imageUrl || undefined)
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

  const ctaBlock = (
    <StatusCard className="space-y-3">
      {isPastEvent ? (
        <div>
          <p className="text-base font-semibold text-[#0a1f38]">Thank you for joining</p>
          <p className="mt-1 text-sm text-[#1c395c]/75">
            We hope you enjoyed the event.
          </p>
        </div>
      ) : isRegistered ? (
        <div>
          <p className="text-base font-semibold text-[#0a1f38]">You&apos;re registered</p>
          <p className="mt-1 text-sm text-[#1c395c]/75">
            See you there — check your calendar invite and ticket below.
          </p>
        </div>
      ) : isWaitlisted ? (
        <div>
          <p className="text-base font-semibold text-[#0a1f38]">You&apos;re on the waitlist</p>
          <p className="mt-1 text-sm text-[#1c395c]/75">
            We&apos;ll notify you if a spot opens up.
          </p>
        </div>
      ) : isPendingApproval ? (
        <div>
          <p className="text-base font-semibold text-[#0a1f38]">Application pending</p>
          <p className="mt-1 text-sm text-[#1c395c]/75">
            The organizer will review your application.
          </p>
        </div>
      ) : !registrationRequired ? (
        <div>
          <p className="text-base font-semibold text-[#0a1f38]">No registration required</p>
          <p className="mt-1 text-sm text-[#1c395c]/75">Just show up — you&apos;re welcome.</p>
        </div>
      ) : canRegister && isLumaEvent ? (
        <div className="space-y-3">
          <div>
            <p className="text-base font-semibold text-[#0a1f38]">Register on Luma</p>
            <p className="mt-1 text-sm text-[#1c395c]/75">
              This event is hosted on Luma. Secure your spot there.
            </p>
          </div>
          <LumaRegistration event={event} />
        </div>
      ) : canRegister ? (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-[#0a1f38]">
                {isFull && event.waitlistEnabled ? "Join the waitlist" : "Reserve your spot"}
              </p>
              {priceLabel && (
                <p className="mt-1 text-sm font-medium text-[#812926]">{priceLabel}</p>
              )}
            </div>
          </div>
          <Button
            className="w-full bg-[#812926] hover:bg-[#6b2120]"
            size="lg"
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
            <p className="text-center text-xs text-[#1c395c]/70">
              <Link
                href={`/login?redirect=${encodeURIComponent(`/events/${event.id}`)}`}
                className="underline underline-offset-2"
              >
                Log in
              </Link>{" "}
              to register
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-[#1c395c]/75">Registration is closed for this event.</p>
      )}

      {(isRegistered || isWaitlisted || isPendingApproval) && !isPastEvent && (
        <Button
          variant="ghost"
          className="w-full text-[#1c395c]/70"
          size="sm"
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
        </Button>
      )}

      {event.capacity != null && !isPastEvent && (
        <div className="space-y-2 border-t border-[#edeff2] pt-3">
          <div className="flex justify-between text-xs text-[#1c395c]/70">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {confirmedCount} / {event.capacity} spots
            </span>
            {(event.waitlistCount ?? 0) > 0 && (
              <span>{event.waitlistCount} waitlisted</span>
            )}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#edeff2]">
            <div
              className="h-full rounded-full bg-[#812926] transition-all"
              style={{
                width: `${Math.min(100, (confirmedCount / event.capacity) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </StatusCard>
  )

  const hostBlock = (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1c395c]/55">
          Presented by
        </p>
        <div className="mt-3 flex items-center gap-3">
          <ImpactHubMark size={40} title="Impact Hub Nairobi" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#0a1f38]">
              Impact Hub Nairobi
            </p>
            <div className="mt-1.5 flex items-center gap-2">
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

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1c395c]/55">
          Hosted by
        </p>
        <div className="mt-3 flex items-center gap-3">
          <HostAvatar name={hostName} />
          <p className="text-sm font-medium text-[#0a1f38]">{hostName}</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-[#0a1f38]">{goingLabel}</p>
        {attendees.length > 0 ? (
          <>
            <div className="mt-3 flex items-center">
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
            <p className="mt-3 text-sm leading-relaxed text-[#1c395c]/80">
              {formatAttendeeLine(attendees, confirmedCount)}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-[#1c395c]/70">
            {isPastEvent ? "No public guest list for this event." : "No one has registered yet."}
          </p>
        )}
      </div>

      <a
        href={`mailto:${hostEmail}?subject=${encodeURIComponent(`Question about ${event.title}`)}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#812926] underline underline-offset-4"
      >
        <Mail className="h-3.5 w-3.5" />
        Contact the host
      </a>

      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#edeff2] bg-[#f3f5f8] px-3 py-1 text-xs font-medium text-[#1c395c]"
            >
              #{tag.replace(/^#/, "")}
            </span>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:gap-12">
          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="overflow-hidden rounded-xl border border-[#edeff2] bg-white shadow-sm">
              {imageSrc ? (
                <div className="relative aspect-square bg-[#edeff2]">
                  <img
                    src={imageSrc}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-[#1c395c] to-[#0a1f38] p-8">
                  <ImpactHubMark size={72} className="opacity-90" />
                </div>
              )}
            </div>

            <div className="hidden lg:block">{ctaBlock}</div>
            <div className="hidden lg:block">{hostBlock}</div>
          </aside>

          {/* Main column */}
          <div className="min-w-0 space-y-8">
            <header className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {event.eventType && (
                  <span className="rounded-full border border-[#edeff2] bg-white px-3 py-1 text-xs font-medium text-[#1c395c]">
                    {eventTypeLabel(event.eventType)}
                  </span>
                )}
                {isPastEvent && (
                  <span className="rounded-full border border-[#edeff2] bg-[#f3f5f8] px-3 py-1 text-xs font-medium text-[#1c395c]/70">
                    Past event
                  </span>
                )}
                {priceLabel && (
                  <span className="rounded-full bg-[#812926] px-3 py-1 text-xs font-medium text-white">
                    {priceLabel}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-[#0a1f38] sm:text-4xl">
                {event.title}
              </h1>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-[#edeff2] bg-white shadow-sm">
                    <span className="text-[10px] font-semibold uppercase leading-none tracking-wide text-[#812926]">
                      {badge.month}
                    </span>
                    <span className="mt-0.5 text-lg font-semibold leading-none text-[#0a1f38]">
                      {badge.day}
                    </span>
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="font-medium text-[#0a1f38]">
                      {formatEventDate(event.startDate, eventTz)}
                    </p>
                    <p className="mt-0.5 text-sm tabular-nums text-[#1c395c]/80">
                      {timeLine} {gmt}
                    </p>
                  </div>
                </div>

                {(event.location || event.onlineUrl || platformInfo) && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#edeff2] bg-white shadow-sm">
                      {platformInfo ? (
                        <EventPlatformBadge
                          icon={platformInfo.icon}
                          label=""
                          size={22}
                          className="[&_span]:sr-only"
                        />
                      ) : (
                        <MapPin className="h-5 w-5 text-[#812926]" />
                      )}
                    </div>
                    <div className="min-w-0 pt-2">
                      <p className="font-medium text-[#0a1f38]">
                        {platformInfo?.label || displayLocation(event)}
                      </p>
                      {platformInfo && event.location && event.locationType !== "online" && (
                        <p className="mt-0.5 text-sm text-[#1c395c]/80">
                          {displayLocation(event)}
                        </p>
                      )}
                      {event.onlineUrl && event.locationType !== "in-person" && (
                        <a
                          href={event.onlineUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-sm text-[#812926] hover:underline"
                        >
                          Join online <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </header>

            <EventVenueMap
              location={event.location}
              locationType={event.locationType}
              googleMapsUrl={event.googleMapsUrl}
            />

            <div className="lg:hidden">{ctaBlock}</div>

            {event.description && (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-[#0a1f38]">About Event</h2>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#1c395c]/85">
                  {event.description}
                </p>
              </section>
            )}

            {isLumaEvent && event.lumaEventUrl && !canRegister && (
              <section className="rounded-xl border border-[#edeff2] bg-white p-5">
                <LumaRegistration event={event} />
              </section>
            )}

            {isRegistered && calendarLinks && (
              <section className="space-y-3 rounded-xl border border-[#edeff2] bg-white p-5">
                <h2 className="font-semibold text-[#0a1f38]">On your calendar</h2>
                <p className="text-sm text-[#1c395c]/75">
                  A calendar invite was sent when you registered. Use these options if you need to
                  add it again.
                </p>
                <EventCalendarActions links={calendarLinks} />
              </section>
            )}

            {isRegistered && ticket && (
              <section className="flex flex-col items-center gap-6 rounded-xl border border-[#edeff2] bg-white p-6 sm:flex-row">
                <img
                  src={ticket.qrDataUrl}
                  alt="Check-in QR code"
                  className="h-44 w-44 rounded-lg border bg-white"
                />
                <div className="text-center sm:text-left">
                  <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
                    <Ticket className="h-5 w-5 text-[#812926]" />
                    <h2 className="text-lg font-semibold text-[#0a1f38]">Your ticket</h2>
                  </div>
                  <p className="text-sm text-[#1c395c]/75">Show this QR code at check-in</p>
                  <p className="mt-3 font-mono text-sm tracking-widest text-[#0a1f38]">
                    {ticket.checkInCode}
                  </p>
                </div>
              </section>
            )}

            <EventSharePanel
              event={{
                id: event.id,
                title: event.title,
                startDate: event.startDate,
                slug: event.slug,
                shortCode: event.shortCode,
              }}
            />

            <div className="border-t border-[#edeff2] pt-8 lg:hidden">{hostBlock}</div>
          </div>
        </div>
      </div>

      {canRegister && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#edeff2] bg-[#faf9f6]/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#0a1f38]">{event.title}</p>
              {priceLabel && (
                <p className="text-xs text-[#1c395c]/70">{priceLabel}</p>
              )}
            </div>
            <Button
              className="bg-[#812926] hover:bg-[#6b2120]"
              onClick={onRegister}
              disabled={registering}
            >
              {registerLabel}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
