"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { CalendarDays, GraduationCap, Handshake, Loader2, Plus, Users2 } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MobileBreadcrumbsHidden, MobileStatsStrip } from "@/components/mobile/mobile-page-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PillTabs } from "@/components/mobile/pill-tabs"
import { MetricCard, MetricCardGrid } from "@/components/design/metric-card"
import {
  DataList,
  DataListRow,
  DataListPrimary,
  DataListMeta,
} from "@/components/design/data-list"
import { StatusDot } from "@/components/design/status-dot"
import { EmptyState } from "@/components/design/empty-state"
import {
  EXPERT_MEETING_STATUSES,
  expertRequestTypeLabel,
  meetingFormatLabel,
} from "@/lib/experts"
import { getEventPublicPath } from "@/lib/event-url"
import { toast } from "@/lib/toast"

type MeetingRow = {
  id: string
  requesterName: string
  requesterEmail: string
  topic: string
  message: string
  preferredTimes: string | null
  meetingFormat: string
  requestType: string
  status: string
  createdAt: string
}

type EventGuest = {
  id: string
  name: string | null
  email: string
  status: string
  createdAt: string
}

type EventRow = {
  id: string
  title: string
  slug: string | null
  shortCode: string | null
  startDate: string
  visibility: string
  registrationsCount: number
  guests: EventGuest[]
}

type DashboardResponse = {
  expert: { name: string; title: string; isPublished: boolean }
  stats: {
    clinicPending: number
    servicesPending: number
    clinicsTotal: number
    servicesTotal: number
    upcomingEvents: number
    totalGuests: number
  }
  clinics: MeetingRow[]
  services: MeetingRow[]
  events: EventRow[]
}

function formatWhen(value: string) {
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: "Africa/Nairobi",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function statusVariant(status: string): "success" | "warning" | "error" | "neutral" {
  if (status === "confirmed" || status === "registered" || status === "attended") return "success"
  if (status === "pending" || status === "waitlisted") return "warning"
  if (status === "declined" || status === "cancelled" || status === "rejected") return "error"
  return "neutral"
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function MeetingRequests({
  rows,
  emptyTitle,
  emptyDescription,
  onStatusChange,
  updatingId,
}: {
  rows: MeetingRow[]
  emptyTitle: string
  emptyDescription: string
  onStatusChange: (id: string, status: string) => void
  updatingId: string | null
}) {
  if (rows.length === 0) {
    return <EmptyState icon={GraduationCap} title={emptyTitle} description={emptyDescription} />
  }

  return (
    <DataList>
      {rows.map((row) => (
        <DataListRow key={row.id} showChevron={false} className="items-start py-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <DataListPrimary
                title={row.topic}
                subtitle={`${row.requesterName} · ${row.requesterEmail}`}
                className="w-auto"
              />
              <StatusDot label={statusLabel(row.status)} variant={statusVariant(row.status)} />
            </div>
            <DataListMeta className="max-w-full sm:max-w-none">
              {formatWhen(row.createdAt)}
            </DataListMeta>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{row.message}</p>
            <p className="text-xs text-muted-foreground">
              {expertRequestTypeLabel(row.requestType)} · {meetingFormatLabel(row.meetingFormat)}
              {row.preferredTimes ? ` · ${row.preferredTimes}` : ""}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                className="text-xs font-medium text-primary hover:underline"
                href={`mailto:${row.requesterEmail}?subject=${encodeURIComponent(row.topic)}`}
              >
                Email member
              </a>
              <Select
                value={row.status}
                onValueChange={(status) => onStatusChange(row.id, status)}
                disabled={updatingId === row.id}
              >
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERT_MEETING_STATUSES.map((status) => (
                    <SelectItem key={status} value={status} className="text-xs capitalize">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DataListRow>
      ))}
    </DataList>
  )
}

export default function ExpertInResidenceDashboardPage() {
  const { data, error, isLoading, mutate } = useSWR<DashboardResponse>(
    "/api/experts/me/dashboard",
    async (url) => {
      const res = await fetch(url)
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof json.error === "string" ? json.error : "Could not load dashboard")
      }
      return json
    }
  )
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [openEventId, setOpenEventId] = useState<string | null>(null)
  const [tab, setTab] = useState("clinics")

  const stats = data?.stats
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }, [])

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/experts/me/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof json.error === "string" ? json.error : "Could not update request")
      }
      toast.success("Request updated")
      await mutate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update request")
    } finally {
      setUpdatingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-w-0 space-y-4 md:space-y-10">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs items={[{ label: "Dashboard" }]} />
        </MobileBreadcrumbsHidden>
        <EmptyState
          icon={GraduationCap}
          title="EIR dashboard unavailable"
          description={
            error instanceof Error
              ? error.message
              : "This space is for invited Experts in Residence."
          }
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/experts">Browse experts</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-4 md:space-y-10">
      <MobileBreadcrumbsHidden>
        <Breadcrumbs items={[{ label: "Dashboard" }]} />
      </MobileBreadcrumbsHidden>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-0.5">
          <h1 className="page-title">
            {greeting}, {data.expert.name.split(" ")[0]}
          </h1>
          <p className="hidden text-sm text-muted-foreground sm:block md:text-base">
            Members requesting 1-on-1 clinics, procuring your services, and joining your events.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!data.expert.isPublished ? (
            <Badge variant="secondary">Profile draft</Badge>
          ) : null}
          <Button asChild size="sm" className="h-9 shrink-0 text-sm md:h-10">
            <Link href="/experts/events/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Host a session
            </Link>
          </Button>
        </div>
      </div>

      <MobileStatsStrip
        items={[
          { label: "Clinics", value: stats?.clinicPending ?? 0, icon: GraduationCap },
          { label: "Services", value: stats?.servicesPending ?? 0, icon: Handshake },
          { label: "Sessions", value: stats?.upcomingEvents ?? 0, icon: CalendarDays },
          { label: "Guests", value: stats?.totalGuests ?? 0, icon: Users2 },
        ]}
      />

      <div className="hidden md:block">
        <MetricCardGrid compact className="sm:grid-cols-4 xl:grid-cols-4">
          <MetricCard
            compact
            label="Clinic requests"
            value={stats?.clinicPending ?? 0}
            description={`${stats?.clinicsTotal ?? 0} total`}
            icon={GraduationCap}
            highlight={(stats?.clinicPending ?? 0) > 0}
          />
          <MetricCard
            compact
            label="Service inquiries"
            value={stats?.servicesPending ?? 0}
            description={`${stats?.servicesTotal ?? 0} total`}
            icon={Handshake}
            highlight={(stats?.servicesPending ?? 0) > 0}
          />
          <MetricCard
            compact
            label="Sessions"
            value={stats?.upcomingEvents ?? 0}
            icon={CalendarDays}
            href="/events"
          />
          <MetricCard compact label="Event guests" value={stats?.totalGuests ?? 0} icon={Users2} />
        </MetricCardGrid>
      </div>

      <div className="space-y-4">
        <div className="overflow-x-auto">
          <PillTabs
            items={[
              { value: "clinics", label: "1-on-1 clinics", count: data.clinics.length },
              { value: "services", label: "Services", count: data.services.length },
              { value: "events", label: "Events", count: data.events.length },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        {tab === "clinics" ? (
          <MeetingRequests
            rows={data.clinics}
            emptyTitle="No clinic requests yet"
            emptyDescription="When members ask for a 1-on-1 clinic, they will show up here."
            onStatusChange={handleStatusChange}
            updatingId={updatingId}
          />
        ) : null}

        {tab === "services" ? (
          <MeetingRequests
            rows={data.services}
            emptyTitle="No service inquiries yet"
            emptyDescription="Members looking to procure your services will appear here."
            onStatusChange={handleStatusChange}
            updatingId={updatingId}
          />
        ) : null}

        {tab === "events" ? (
          data.events.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No sessions yet"
              description="Host a virtual session so members can register and show up in this list."
              action={
                <Button asChild size="sm">
                  <Link href="/experts/events/new">Host a session</Link>
                </Button>
              }
            />
          ) : (
            <DataList>
              {data.events.map((event) => {
                const open = openEventId === event.id
                return (
                  <div key={event.id}>
                    <DataListRow showChevron={false}>
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => setOpenEventId(open ? null : event.id)}
                      >
                        <DataListPrimary
                          title={event.title}
                          subtitle={`${formatWhen(event.startDate)} · ${event.registrationsCount} guest${
                            event.registrationsCount === 1 ? "" : "s"
                          }`}
                        />
                      </button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={getEventPublicPath(event)}>View</Link>
                      </Button>
                    </DataListRow>
                    {open ? (
                      <div className="border-b border-border bg-muted/30 px-4 py-3 last:border-b-0">
                        {event.guests.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No registrations yet.</p>
                        ) : (
                          <ul className="space-y-2">
                            {event.guests.map((guest) => (
                              <li
                                key={guest.id}
                                className="flex flex-wrap items-center justify-between gap-2 text-sm"
                              >
                                <span>
                                  {guest.name || guest.email}
                                  {guest.name ? (
                                    <span className="text-muted-foreground"> · {guest.email}</span>
                                  ) : null}
                                </span>
                                <StatusDot
                                  label={statusLabel(guest.status)}
                                  variant={statusVariant(guest.status)}
                                />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </DataList>
          )
        ) : null}
      </div>
    </div>
  )
}
