"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, Loader2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EventPublicLayout } from "@/components/events/event-public-layout"
import { EventFlyer } from "@/components/events/event-flyer"
import { eventTypeLabel } from "@/lib/event-constants"
import { formatEventPrice } from "@/lib/event-questions"
import { getEventPublicPath } from "@/lib/event-url"
import { richTextToPlainText } from "@/lib/rich-text"
import { eventCalendarDate, formatEventTime24 } from "@/lib/event-datetime"

interface PublicEvent {
  id: string
  title: string
  startDate: string
  endDate?: string | null
  location?: string | null
  eventType: string
  price?: number | null
  currency?: string | null
  imageUrl?: string | null
  description?: string | null
  timezone?: string | null
  slug?: string | null
  shortCode?: string | null
}

function formatWhen(event: PublicEvent) {
  const tz = event.timezone || "Africa/Nairobi"
  const date = eventCalendarDate(event.startDate, tz)
  const time = formatEventTime24(event.startDate, tz)
  const endTime = event.endDate ? formatEventTime24(event.endDate, tz) : null
  const dateStr = date.toLocaleDateString("en-KE", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: tz,
  })
  return endTime ? `${dateStr} · ${time} – ${endTime}` : `${dateStr} · ${time}`
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
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#812926]">
            Impact Hub Nairobi
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[#0a1f38] md:text-3xl">
            Upcoming public events
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#1c395c]/80">
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
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => {
                const excerpt = richTextToPlainText(event.description, 120)
                const priceLabel =
                  event.price != null
                    ? formatEventPrice(event.price, event.currency ?? "KES") ?? "Free"
                    : "Free"

                return (
                  <Link key={event.id} href={getEventPublicPath(event)} className="group block h-full">
                    <Card className="flex h-full flex-col overflow-hidden border-[#edeff2] transition-colors hover:border-[#812926]/30 hover:shadow-sm">
                      <EventFlyer src={event.imageUrl} alt="" variant="card" />
                      <div className="flex flex-1 flex-col gap-2 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#812926]">
                          {eventTypeLabel(event.eventType)}
                        </p>
                        <h2 className="line-clamp-2 text-base font-semibold text-[#0a1f38] group-hover:underline">
                          {event.title}
                        </h2>
                        {excerpt ? (
                          <p className="line-clamp-3 text-sm leading-relaxed text-[#1c395c]/75">
                            {excerpt}
                          </p>
                        ) : null}
                        <div className="mt-auto space-y-1 pt-2 text-xs text-[#1c395c]/70">
                          <p className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-[#812926]" aria-hidden />
                            {formatWhen(event)}
                          </p>
                          {event.location ? (
                            <p className="line-clamp-1">{event.location}</p>
                          ) : null}
                        </div>
                        <p className="text-sm font-medium text-[#812926]">{priceLabel}</p>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
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
