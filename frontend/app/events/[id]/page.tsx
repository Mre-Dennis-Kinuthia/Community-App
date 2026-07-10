"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { isBefore } from "date-fns"
import { useSession } from "@/lib/use-session"
import { toast } from "@/lib/toast"
import {
  formatEventPrice,
  isPaidEvent,
  parseRegistrationQuestions,
} from "@/lib/event-questions"
import { EventRegistrationDialog } from "@/components/events/event-registration-dialog"
import { EventPublicLayout } from "@/components/events/event-public-layout"
import { EventPublicView } from "@/components/events/event-public-view"
import { autoImportFromRegistrationResponse } from "@/lib/event-calendar-client"
import { getEventCalendarLinks } from "@/lib/event-calendar"
import { isLumaRegistration } from "@/lib/luma"
import { isEventCuid } from "@/lib/event-slug"

interface EventDetailPageProps {
  params: Promise<{ id: string }>
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
  slug?: string | null
  shortCode?: string | null
  timezone?: string | null
  registrationProvider?: string | null
  lumaEventUrl?: string | null
  lumaEventId?: string | null
  attendeePreview?: Array<{ name: string; image: string | null }>
}

type UserRegistration = {
  id: string
  status: string
  createdAt: string
} | null

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = use(params)
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
          if (res.status === 403 && !cancelled) {
            setError(data.error || "You need to log in to view this event.")
            setEvent(null)
            return
          }
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

  useEffect(() => {
    if (event?.slug && isEventCuid(id) && id !== event.slug) {
      router.replace(`/events/${event.slug}`, { scroll: false })
    }
  }, [event?.slug, id, router])

  const eventStartDate = event ? new Date(event.startDate) : null
  const isPastEvent = eventStartDate ? isBefore(eventStartDate, new Date()) : false
  const confirmedCount = event?.confirmedCount ?? 0
  const isFull = event?.capacity != null && confirmedCount >= event.capacity
  const registrationRequired = event?.registrationRequired !== false
  const isLumaEvent = event ? isLumaRegistration(event.registrationProvider) : false
  const registrationStatus = userRegistration?.status
  const isRegistered =
    registrationStatus === "registered" || registrationStatus === "attended"
  const isWaitlisted = registrationStatus === "waitlisted"
  const isPendingApproval = registrationStatus === "pending"
  const canRegister =
    event &&
    !isPastEvent &&
    registrationRequired &&
    !isRegistered &&
    !isWaitlisted &&
    !isPendingApproval &&
    (!isFull || event.waitlistEnabled) &&
    (!isLumaEvent || Boolean(event.lumaEventUrl))

  const questions = parseRegistrationQuestions(event?.registrationQuestions)
  const priceLabel = event ? formatEventPrice(event.price, event.currency ?? "KES") : null

  const calendarLinks = event
    ? getEventCalendarLinks(
        {
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          timezone: event.timezone,
          location: event.location,
          locationType: event.locationType,
          onlineUrl: event.onlineUrl,
          slug: event.slug,
          shortCode: event.shortCode,
        },
        id
      )
    : null

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
      if (data.registration?.status === "registered") {
        void autoImportFromRegistrationResponse(data)
        toast.success("You're registered — calendar invite saved. Check your calendar app or email.")
      } else {
        toast.success(
          data.registration?.status === "pending"
            ? "Application submitted — the organizer will review it."
            : data.registration?.status === "waitlisted"
              ? "You're on the waitlist."
              : "You're registered for this event."
        )
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to register")
    } finally {
      setRegistering(false)
    }
  }

  const handleRegister = () => {
    if (!event || !canRegister) return
    if (isLumaEvent && event.lumaEventUrl) {
      window.open(event.lumaEventUrl, "_blank", "noopener,noreferrer")
      return
    }
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

  const registerLabel = isLumaEvent
    ? "Register on Luma"
    : isFull && event?.waitlistEnabled
      ? "Join waitlist"
      : "Register"

  return (
    <EventPublicLayout>
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !event ? (
        <div className="mx-auto max-w-lg space-y-4 px-4 py-24 text-center">
          <p className="text-muted-foreground">
            {error || "We couldn't find an event with this link."}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {!user && error?.toLowerCase().includes("log in") && (
              <Button asChild>
                <Link href={`/login?redirect=${encodeURIComponent(`/events/${id}`)}`}>
                  Log in to view
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href={user ? "/events" : "/"}>Go back</Link>
            </Button>
          </div>
        </div>
      ) : (
        <EventPublicView
          event={event}
          isPastEvent={isPastEvent}
          isRegistered={isRegistered}
          isWaitlisted={isWaitlisted}
          isPendingApproval={isPendingApproval}
          canRegister={Boolean(canRegister)}
          isLumaEvent={isLumaEvent}
          registering={registering}
          cancelling={cancelling}
          registerLabel={registerLabel}
          priceLabel={priceLabel}
          calendarLinks={calendarLinks}
          ticket={ticket}
          isLoggedIn={Boolean(user)}
          onRegister={handleRegister}
          onCancel={handleCancel}
        />
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
