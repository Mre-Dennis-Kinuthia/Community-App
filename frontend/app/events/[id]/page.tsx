/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Users, Loader2, Copy } from "lucide-react"
import { format, isBefore } from "date-fns"
import Link from "next/link"
import { useSession } from "@/lib/use-session"
import { toast } from "@/lib/toast"
import { displayLocation, eventTypeLabel, formatLocationType } from "@/lib/event-constants"
import {
  formatEventPrice,
  isPaidEvent,
  parseRegistrationQuestions,
} from "@/lib/event-questions"
import { EventRegistrationDialog } from "@/components/events/event-registration-dialog"
import { Badge } from "@/components/ui/badge"

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
      if (!response.ok) {
        throw new Error(data.error || "Failed to register")
      }
      setRegDialogOpen(false)
      const refresh = await fetch(`/api/events/${event.id}`)
      if (refresh.ok) {
        const refreshed = await refresh.json()
        setEvent(refreshed.event)
        setUserRegistration(refreshed.userRegistration ?? null)
      }
      if (data.registration?.status === "waitlisted") {
        toast.success("You're on the waitlist.")
      } else {
        toast.success("You're registered for this event.")
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to register")
    } finally {
      setRegistering(false)
    }
  }

  const handleRegister = () => {
    if (!event || !canRegister) return
    if (!user?.email) {
      toast.info("Please log in to register for this event.")
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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied")
    } catch {
      toast.error("Could not copy link")
    }
  }

  const title = event?.title ?? "Event not found"

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6 pb-28 md:pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {event && (
              <p className="text-muted-foreground mt-1">
                {format(new Date(event.startDate), "EEEE, MMMM d, yyyy · h:mm a")}
              </p>
            )}
            {priceLabel && (
              <p className="text-lg font-semibold mt-2">{priceLabel}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canRegister && (
              <Button size="sm" onClick={handleRegister} disabled={registering}>
                {registering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isFull && event?.waitlistEnabled ? "Joining..." : "Registering..."}
                  </>
                ) : isFull && event?.waitlistEnabled ? (
                  "Join waitlist"
                ) : (
                  "Register"
                )}
              </Button>
            )}
            {isRegistered && (
              <Button variant="outline" size="sm" disabled>
                ✓ Registered
              </Button>
            )}
            {isWaitlisted && (
              <>
                <Button variant="outline" size="sm" disabled>
                  On waitlist
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? "Cancelling..." : "Leave waitlist"}
                </Button>
              </>
            )}
            {isRegistered && !isPastEvent && (
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? "Cancelling..." : "Cancel registration"}
              </Button>
            )}
            {!registrationRequired && event && !isPastEvent && (
              <Badge variant="secondary">No registration required</Badge>
            )}
            <Button variant="outline" size="sm" className="gap-1" onClick={copyLink}>
              <Copy className="h-4 w-4" />
              Copy link
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/events">All events</Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-6 flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : event ? (
          <>
            {event.imageUrl && (
              <div className="rounded-xl overflow-hidden border h-56 md:h-72">
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
              </div>
            )}

            {isRegistered && ticket && (
              <Card>
                <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-6">
                  <img
                    src={ticket.qrDataUrl}
                    alt="Check-in QR code"
                    className="w-48 h-48 rounded-lg border"
                  />
                  <div className="text-center sm:text-left">
                    <h2 className="font-semibold text-lg">Your ticket</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Show this QR code at check-in
                    </p>
                    <p className="font-mono text-sm mt-3 tracking-widest">{ticket.checkInCode}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {event.eventType && (
                    <Badge variant="secondary">{eventTypeLabel(event.eventType)}</Badge>
                  )}
                  <Badge variant="outline">{formatLocationType(event.locationType)}</Badge>
                  {priceLabel && <Badge variant="outline">{priceLabel}</Badge>}
                  {isPastEvent && <Badge variant="outline">Past event</Badge>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    {format(new Date(event.startDate), "PPP")}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" />
                    {format(new Date(event.startDate), "p")}
                    {event.endDate && ` – ${format(new Date(event.endDate), "p")}`}
                  </div>
                  {(event.location || event.onlineUrl) && (
                    <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {displayLocation(event)}
                    </div>
                  )}
                </div>

                {event.capacity != null && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {confirmedCount} / {event.capacity} spots filled
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${Math.min(100, (confirmedCount / event.capacity) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {event.description && (
                  <div>
                    <h2 className="font-semibold mb-2">About this event</h2>
                    <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6 py-8 text-muted-foreground">
              {error || "We couldn't find an event with this link."}
            </CardContent>
          </Card>
        )}
      </div>

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

      {canRegister && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background shadow-sm pb-[env(safe-area-inset-bottom)] md:hidden">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
            <p className="truncate font-semibold flex-1">{event?.title}</p>
            <Button onClick={handleRegister} disabled={registering}>
              {isFull && event?.waitlistEnabled ? "Join waitlist" : "Register"}
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
