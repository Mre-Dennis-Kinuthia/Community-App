"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { eventTypeLabel } from "@/lib/event-constants"
import { formatEventPrice } from "@/lib/event-questions"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { cn } from "@/lib/utils"

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

function SectionHeader({
  label,
  title,
  description,
  className,
}: {
  label?: string
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      {label ? <p className="section-label mb-3">{label}</p> : null}
      <h2 className="section-title text-balance">{title}</h2>
      {description ? (
        <p className="section-lead mx-auto mt-4 max-w-2xl text-pretty">{description}</p>
      ) : null}
    </div>
  )
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
        <SectionHeader
          label="Events & programs"
          title="What's happening at Impact Hub Nairobi"
          description="Workshops, mixers, and programs open to the public — register to join the community in person or online."
          className="mb-10 md:mb-12"
        />

        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Calendar className="h-10 w-10 text-[#812926]/40" aria-hidden />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#812926]">
                    {eventTypeLabel(event.eventType)}
                  </span>
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
