"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatEventPrice } from "@/lib/event-questions"
import { getImageDisplayUrl } from "@/lib/stored-image"

export interface LandingEventTeaser {
  id: string
  title: string
  startDate: string
  endDate: string | null
  location: string | null
  eventType: string
  imageUrl: string | null
  price: number | null
  currency: string | null
}

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  })
}

export function LandingEventsSection() {
  const [events, setEvents] = useState<LandingEventTeaser[]>([])

  useEffect(() => {
    let cancelled = false
    fetch("/api/landing/events?limit=6")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { events?: LandingEventTeaser[] } | null) => {
        if (!cancelled && data?.events) setEvents(data.events)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (events.length === 0) return null

  return (
    <section id="events" className="landing-section bg-[#f3f5f8]/50">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl md:max-w-none">
          <h2 className="text-xl font-semibold tracking-tight text-[#0a1f38] md:text-2xl">
            Upcoming events
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#1c395c]/85 md:text-base">
            Workshops, office hours, and community gatherings — open to members and the public.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const imageSrc = getImageDisplayUrl(event.imageUrl || undefined)
            const priceLabel =
              event.price != null
                ? formatEventPrice(event.price, event.currency ?? "KES") ?? "Paid"
                : "Free"

            return (
              <article
                key={event.id}
                className="landing-events-card group flex flex-col overflow-hidden rounded-md border border-[#edeff2] bg-white"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#1c395c]/10">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#f3f5f8]">
                      <Calendar className="h-8 w-8 text-[#1c395c]/25" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-base font-semibold leading-snug text-[#0a1f38]">
                    {event.title}
                  </h3>
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-[#1c395c]/75">
                    <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#812926]" aria-hidden />
                    {formatEventDate(event.startDate)}
                  </p>
                  {event.location ? (
                    <p className="mt-1 flex items-start gap-1.5 text-xs text-[#1c395c]/70">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="line-clamp-1">{event.location}</span>
                    </p>
                  ) : null}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="text-xs font-medium text-[#812926]">{priceLabel}</span>
                    <Link
                      href={`/events/${event.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1c395c] transition-colors hover:text-[#812926]"
                    >
                      View & register
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <Link href="/events/public">
            <Button variant="outline" className="border-[#1c395c]/20 bg-white hover:bg-[#faf9f6]">
              Browse all public events
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
