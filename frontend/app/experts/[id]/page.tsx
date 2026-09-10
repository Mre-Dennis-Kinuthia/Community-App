"use client"

import { use } from "react"
import useSWR from "swr"
import Link from "next/link"
import { ArrowLeft, CalendarDays, ExternalLink, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MobilePageHeader, MobileBreadcrumbsHidden } from "@/components/mobile/mobile-page-shell"
import { ExpertPhoto } from "@/components/experts/expert-photo"
import { ExpertMeetingForm } from "@/components/experts/expert-meeting-form"
import { getEventPublicPath } from "@/lib/event-url"
import type { Expert, ExpertEvent } from "@/types/expert"

type ExpertDetailResponse = {
  expert: Expert & { events: ExpertEvent[] }
}

function formatSessionWhen(startDate: string) {
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: "Africa/Nairobi",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(startDate))
}

export default function ExpertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data, error, isLoading } = useSWR<ExpertDetailResponse>(
    `/api/experts/${id}`,
    async (url) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error("Expert not found")
      return res.json()
    }
  )

  const expert = data?.expert

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !expert) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-5xl space-y-6">
          <Breadcrumbs
            items={[{ label: "Experts in Residence", href: "/experts" }, { label: "Not found" }]}
          />
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="mb-4 text-sm text-muted-foreground">
                {error?.message || "This expert could not be found."}
              </p>
              <Button asChild>
                <Link href="/experts">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to experts
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const events = expert.events ?? []

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-5xl space-y-6 overflow-x-hidden">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs
            items={[
              { label: "Experts in Residence", href: "/experts" },
              { label: expert.name },
            ]}
          />
        </MobileBreadcrumbsHidden>

        <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
          <Link href="/experts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All experts
          </Link>
        </Button>

        <MobilePageHeader title={expert.name} description={expert.title} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-border">
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <ExpertPhoto name={expert.name} photoUrl={expert.photoUrl} size="lg" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {expert.isFeatured ? <Badge>Featured</Badge> : null}
                      {expert.organization ? (
                        <Badge variant="outline">{expert.organization}</Badge>
                      ) : null}
                    </div>
                    <h1 className="hidden text-2xl font-semibold md:block">{expert.name}</h1>
                    <p className="text-base text-muted-foreground">{expert.title}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">About</h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {expert.bio}
                  </p>
                </div>
              </CardContent>
            </Card>

            {expert.expertise.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {expert.expertise.map((area) => (
                    <Badge key={area} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}

            {expert.initiatives.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Initiatives they support</h2>
                <div className="flex flex-wrap gap-2">
                  {expert.initiatives.map((area) => (
                    <Badge key={area} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}

            {events.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Upcoming virtual sessions</h2>
                <div className="space-y-3">
                  {events.map((event) => (
                    <Link
                      key={event.id}
                      href={getEventPublicPath(event)}
                      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
                    >
                      <p className="font-medium">{event.title}</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatSessionWhen(event.startDate)}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className="space-y-4 lg:sticky lg:top-6">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Set up a meeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {expert.bookingUrl ? (
                  <Button className="w-full" asChild>
                    <a href={expert.bookingUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open calendar
                    </a>
                  </Button>
                ) : null}
                {expert.linkedInUrl ? (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={expert.linkedInUrl} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  </Button>
                ) : null}
                <ExpertMeetingForm expertId={expert.slug || expert.id} expertName={expert.name} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
