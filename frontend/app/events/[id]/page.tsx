/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Loader2,
  ExternalLink,
  Ticket,
} from "lucide-react"
import { format, isBefore } from "date-fns"
import { useSession } from "@/lib/use-session"
import { toast } from "@/lib/toast"
import { displayLocation, eventTypeLabel, formatLocationType } from "@/lib/event-constants"
import {
  formatEventPrice,
  isPaidEvent,
  parseRegistrationQuestions,
} from "@/lib/event-questions"
import { EventRegistrationDialog } from "@/components/events/event-registration-dialog"
import { EventPublicLayout } from "@/components/events/event-public-layout"
import { EventSharePanel } from "@/components/events/event-share-panel"

interface EventDetailPageProps {
  params: { id: string }
}

interface EventData {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  location: string | null
  locationType?: string | null
  onlineUrl?: string | null
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
  registrationQuestions?: unknown
}

type UserRegistration = {
  id: string
  status: string
  createdAt: string
} | null

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = params
  const router = useRouter()
  const { user } = useSession()

  const [event, setEvent] = useState<EventData | null>(null)
  const [userRegistration, setUserRegistration] = useState<UserRegistration>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [regDialogOpen, setRegDialogOpen] = useState(false)
  const [ticket, setTicket] = useState<{ qrDataUrl: string; checkInCode: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadEvent() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/events/${id}`)
        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) setEvent(null)
            return
          }
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Failed to load event")
        }
        const data = await res.json()
        if (!cancelled) {
          setEvent(data.event)
          setUserRegistration(data.userRegistration ?? null)
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load event")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadEvent()
    return () => {
      cancelled = true
    }
  }, [id])

  const eventStartDate = event ? new Date(event.startDate) : null
  const isPastEvent = eventStartDate ? isBefore(eventStartDate, new Date()) : false
  const confirmedCount = event?.confirmedCount ?? 0
  const isFull = event?.capacity != null && confirmedCount >= event.capacity
  const registrationRequired = event?.registrationRequired !== false
  const registrationStatus = userRegistration?.status
  const isRegistered =
    registrationStatus === "registered" || registrationStatus === "attended"
  const isWaitlisted = registrationStatus === "waitlisted"
  const canRegister =
    event &&
    !isPastEvent &&
    registrationRequired &&
    !isRegistered &&
    !isWaitlisted &&
    (!isFull || event.waitlistEnabled)

  const questions = parseRegistrationQuestions(event?.registrationQuestions)
  const priceLabel = event ? formatEventPrice(event.price, event.currency ?? "KES") : null

  useEffect(() => {
    if (!isRegistered || !event || !user) {
      setTicket(null)
      return
    }
    let cancelled = false
    fetch(`/api/events/${event.id}/ticket`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.ticket) {
          setTicket({
            qrDataUrl: data.ticket.qrDataUrl,
            checkInCode: data.ticket.checkInCode,
          })
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isRegistered, event, user])

  const submitRegistration = async (answers: Record<string, string>) => {
    if (!event || !user?.email) return
    try {
      setRegistering(true)
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.name || undefined,
          answers,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Failed to register")
      setRegDialogOpen(false)
      const refresh = await fetch(`/api/events/${event.id}`)
      if (refresh.ok) {
        const refreshed = await refresh.json()
        setEvent(refreshed.event)
        setUserRegistration(refreshed.userRegistration ?? null)
      }
      toast.success(
        data.registration?.status === "waitlisted"
          ? "You're on the waitlist."
          : "You're registered for this event."
      )
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to register")
    } finally {
      setRegistering(false)
    }
  }

  const handleRegister = () => {
    if (!event || !canRegister) return
    if (!user?.email) {
      toast.info("Log in to register for this event.")
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
      )
      return
    }
    if (questions.length > 0 || isPaidEvent(event.price)) {
      setRegDialogOpen(true)
    } else {
      submitRegistration({})
    }
  }

  const handleCancel = async () => {
    if (!event || cancelling) return
    try {
      setCancelling(true)
      const res = await fetch(`/api/events/${event.id}/register`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Failed to cancel")
      setUserRegistration(null)
      setTicket(null)
      const refresh = await fetch(`/api/events/${event.id}`)
      if (refresh.ok) {
        const refreshed = await refresh.json()
        setEvent(refreshed.event)
      }
      toast.success("Registration cancelled")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to cancel")
    } finally {
      setCancelling(false)
    }
  }

  const registerLabel =
    isFull && event?.waitlistEnabled ? "Join waitlist" : "Register"

  return (
    <EventPublicLayout>
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !event ? (
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-muted-foreground mb-4">
            {error || "We couldn't find an event with this link."}
          </p>
          <Button asChild variant="outline">
            <Link href={user ? "/events" : "/"}>Go back</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Hero */}
          <div className="relative border-b">
            {event.imageUrl ? (
              <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden">
                <img
                  src={event.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              </div>
            ) : (
              <div className="h-24 bg-gradient-to-b from-primary/10 to-background" />
            )}
            <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-16 sm:-mt-20 relative pb-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {event.eventType && (
                  <Badge variant="secondary">{eventTypeLabel(event.eventType)}</Badge>
                )}
                <Badge variant="outline">{formatLocationType(event.locationType)}</Badge>
                {isPastEvent && <Badge variant="outline">Past event</Badge>}
                {priceLabel && (
                  <Badge className="bg-primary text-primary-foreground">{priceLabel}</Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                {event.title}
              </h1>
              {event.organizerName && (
                <p className="text-muted-foreground mt-2">
                  Hosted by {event.organizerName}
                </p>
              )}
            </div>
          </div>

          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 pb-28 md:pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-8">
                <section className="grid sm:grid-cols-2 gap-4">
                  <div className="flex gap-3 rounded-xl border p-4">
                    <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Date
                      </p>
                      <p className="font-medium">{format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 rounded-xl border p-4">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Time
                      </p>
                      <p className="font-medium">
                        {format(new Date(event.startDate), "h:mm a")}
                        {event.endDate && ` – ${format(new Date(event.endDate), "h:mm a")}`}
                      </p>
                    </div>
                  </div>
                  {(event.location || event.onlineUrl) && (
                    <div className="flex gap-3 rounded-xl border p-4 sm:col-span-2">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Location
                        </p>
                        <p className="font-medium">{displayLocation(event)}</p>
                        {event.onlineUrl && event.locationType !== "in-person" && (
                          <a
                            href={event.onlineUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary mt-1 hover:underline"
                          >
                            Join online <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </section>

                {event.description && (
                  <section>
                    <h2 className="text-lg font-semibold mb-3">About this event</h2>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {event.description}
                    </p>
                  </section>
                )}

                {event.tags && event.tags.length > 0 && (
                  <section className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </section>
                )}

                {isRegistered && ticket && (
                  <section className="rounded-xl border p-6 flex flex-col sm:flex-row items-center gap-6 bg-muted/30">
                    <img
                      src={ticket.qrDataUrl}
                      alt="Check-in QR code"
                      className="w-44 h-44 rounded-lg border bg-white"
                    />
                    <div className="text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <Ticket className="h-5 w-5 text-primary" />
                        <h2 className="font-semibold text-lg">Your ticket</h2>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Show this QR code at check-in
                      </p>
                      <p className="font-mono text-sm mt-3 tracking-widest">{ticket.checkInCode}</p>
                    </div>
                  </section>
                )}

                <EventSharePanel
                  eventId={event.id}
                  eventTitle={event.title}
                  startDate={event.startDate}
                />
              </div>

              {/* Sticky registration sidebar */}
              <aside className="lg:col-span-1">
                <div className="lg:sticky lg:top-20 space-y-4">
                  <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.startDate), "EEE, MMM d · h:mm a")}
                      </p>
                      {priceLabel && (
                        <p className="text-2xl font-bold mt-1">{priceLabel}</p>
                      )}
                    </div>

                    {event.capacity != null && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {confirmedCount} / {event.capacity} spots
                          </span>
                          {(event.waitlistCount ?? 0) > 0 && (
                            <span className="text-muted-foreground text-xs">
                              {event.waitlistCount} waitlisted
                            </span>
                          )}
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${Math.min(100, (confirmedCount / event.capacity) * 100)}%`,
                            }}
                          />
                        </div>
                        {isFull && event.waitlistEnabled && !isRegistered && !isWaitlisted && (
                          <p className="text-xs text-muted-foreground">
                            Event is full — join the waitlist for a chance to attend.
                          </p>
                        )}
                      </div>
                    )}

                    {canRegister && (
                      <Button className="w-full" size="lg" onClick={handleRegister} disabled={registering}>
                        {registering ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isFull && event.waitlistEnabled ? "Joining..." : "Registering..."}
                          </>
                        ) : (
                          registerLabel
                        )}
                      </Button>
                    )}

                    {isRegistered && (
                      <Button variant="outline" className="w-full" disabled>
                        ✓ Registered
                      </Button>
                    )}

                    {isWaitlisted && (
                      <Button variant="outline" className="w-full" disabled>
                        On waitlist
                      </Button>
                    )}

                    {(isRegistered || isWaitlisted) && !isPastEvent && (
                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground"
                        size="sm"
                        onClick={handleCancel}
                        disabled={cancelling}
                      >
                        {cancelling ? "Cancelling..." : isWaitlisted ? "Leave waitlist" : "Cancel registration"}
                      </Button>
                    )}

                    {isPastEvent && (
                      <p className="text-sm text-center text-muted-foreground">This event has ended.</p>
                    )}

                    {!registrationRequired && !isPastEvent && (
                      <p className="text-sm text-center text-muted-foreground">
                        No registration required — just show up!
                      </p>
                    )}

                    {!user && canRegister && (
                      <p className="text-xs text-center text-muted-foreground">
                        <Link href={`/login?redirect=${encodeURIComponent(`/events/${event.id}`)}`} className="underline">
                          Log in
                        </Link>{" "}
                        to register
                      </p>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {canRegister && (
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden">
              <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sm">{event.title}</p>
                  {priceLabel && <p className="text-xs text-muted-foreground">{priceLabel}</p>}
                </div>
                <Button onClick={handleRegister} disabled={registering}>
                  {registerLabel}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {event && (
        <EventRegistrationDialog
          open={regDialogOpen}
          onOpenChange={setRegDialogOpen}
          eventTitle={event.title}
          questions={questions}
          isWaitlist={Boolean(isFull && event.waitlistEnabled)}
          isPaid={isPaidEvent(event.price)}
          priceLabel={priceLabel}
          loading={registering}
          onSubmit={submitRegistration}
        />
      )}
    </EventPublicLayout>
  )
}
