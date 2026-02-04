/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Users, Loader2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

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
  capacity: number | null
  imageUrl: string | null
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = params
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadEvent() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/events/${id}`)
        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) {
              setEvent(null)
            }
            return
          }
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Failed to load event")
        }
        const data = await res.json()
        if (!cancelled) {
          setEvent(data.event)
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load event")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadEvent()

    return () => {
      cancelled = true
    }
  }, [id])

  const title = event?.title ?? "Event not found"
  const subtitle = event
    ? "Detailed view for this community event."
    : "We couldn’t find an event with this link. It may have been removed or the link is incorrect."

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/events">Back to events</Link>
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Loading event...</span>
              </div>
            </CardContent>
          </Card>
        ) : event ? (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col gap-6 md:flex-row">
                {event.imageUrl && (
                  <div className="w-full md:w-1/3">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-48 w-full rounded-md object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(event.startDate), "EEE, MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(event.startDate), "HH:mm")}
                        {event.endDate
                          ? ` – ${format(new Date(event.endDate), "HH:mm")}`
                          : ""}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {typeof event.capacity === "number" && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{event.capacity} capacity</span>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground">
                <span>
                  This is a direct event link. You can also browse all events from the main
                  events page.
                </span>
                <Button asChild size="sm">
                  <Link href={`/events?tab=upcoming`}>View upcoming events</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="py-8 text-sm text-muted-foreground">
                {error || "We couldn’t find an event with this ID."}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
