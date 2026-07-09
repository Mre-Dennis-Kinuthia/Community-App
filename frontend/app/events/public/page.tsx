"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventPublicLayout } from "@/components/events/event-public-layout"
import { eventTypeLabel } from "@/lib/event-constants"
import { formatEventPrice } from "@/lib/event-questions"

interface PublicEvent {
  id: string
  title: string
  startDate: string
  location?: string | null
  eventType: string
  price?: number | null
  currency?: string | null
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  })
}

export default function PublicEventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/events?filter=upcoming&limit=50")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setEvents(data?.events ?? data ?? [])
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <EventPublicLayout>
      <div className="bg-[#faf9f6]">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">
            Impact Hub Nairobi
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[#0a1f38] md:text-3xl">
            Upcoming public events
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#1c395c]/80">
            Workshops, mixers, and programs open to everyone. Sign in for member-only events, or
            register as a guest on each event page.
          </p>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#812926]" aria-hidden />
            </div>
          ) : events.length === 0 ? (
            <div className="mt-10 rounded-md border border-[#edeff2] bg-white p-8 text-center">
              <Calendar className="mx-auto h-10 w-10 text-[#812926]/50" aria-hidden />
              <p className="mt-4 text-sm text-[#1c395c]/80">
                No public events scheduled right now. Check back soon or join our newsletter on the
                homepage.
              </p>
              <Button asChild className="mt-6 bg-[#812926] hover:bg-[#6b2120]">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-8 space-y-3">
              {events.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className="block rounded-md border border-[#edeff2] bg-white p-4 transition-colors hover:border-[#812926]/30 hover:bg-white"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#812926]">
                          {eventTypeLabel(event.eventType)}
                        </p>
                        <h2 className="mt-1 font-semibold text-[#0a1f38]">{event.title}</h2>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-[#1c395c]/75">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-[#812926]" aria-hidden />
                          {formatWhen(event.startDate)}
                        </p>
                        {event.location ? (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#1c395c]/70">
                            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            {event.location}
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-sm font-medium text-[#812926]">
                        {event.price != null
                          ? formatEventPrice(event.price, event.currency ?? "KES") ?? "Free"
                          : "Free"}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-10 text-center text-sm text-[#1c395c]/75">
            Already a member?{" "}
            <Link href="/login?redirect=/events" className="font-medium text-[#812926] hover:underline">
              Sign in
            </Link>{" "}
            to see member-only events.
          </p>
        </div>
      </div>
    </EventPublicLayout>
  )
}
