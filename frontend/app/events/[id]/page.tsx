import { DashboardLayout } from "@/app/dashboard/layout"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface EventPageProps {
  params: { id: string }
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = params

  const event = await prisma.event.findUnique({
    where: { id },
  })

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {event?.title ?? "Event not found"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {event
                ? "Detailed view for this community event."
                : "We couldn’t find an event with this link. It may have been removed or the link is incorrect."}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/events">Back to events</Link>
          </Button>
        </div>

        {event && (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col gap-6 md:flex-row">
                {event.imageUrl && (
                  <div className="w-full md:w-1/3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
        )}
      </div>
    </DashboardLayout>
  )
}

