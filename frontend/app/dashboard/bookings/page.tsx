"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { format } from "date-fns"
import { PillTabs } from "@/components/mobile/pill-tabs"
import { PageShell } from "@/components/design/page-shell"
import {
  DataList,
  DataListRow,
  DataListPrimary,
  DataListMeta,
} from "@/components/design/data-list"
import { StatusDot } from "@/components/design/status-dot"
import { EmptyState } from "@/components/design/empty-state"

interface Booking {
  id: string
  resourceType: string
  date: string
  startTime: string
  endTime: string | null
  duration: string
  status: string
  totalPrice: number
  createdAt?: string
  spaceAsset?: { id: string; name: string; type: string } | null
}

function statusVariant(status: string): "success" | "warning" | "error" | "neutral" {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "success"
    case "pending":
      return "warning"
    case "cancelled":
      return "error"
    default:
      return "neutral"
  }
}

export default function DashboardBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/bookings", { credentials: "include" })
      if (!response.ok) {
        if (response.status === 401) {
          setError("Please log in to view your bookings.")
          setBookings([])
          return
        }
        throw new Error("Failed to load bookings")
      }
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch {
      setError("Failed to load bookings. Please try again.")
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const resourceLabel = (type: string) =>
    type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

  const upcoming = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(b.date) >= new Date()
  )
  const past = bookings.filter(
    (b) => b.status === "cancelled" || new Date(b.date) < new Date()
  )

  const displayed = activeTab === "upcoming" ? upcoming : past

  return (
    <PageShell
      title="My bookings"
      description="View and manage your workspace bookings"
      actions={
        <Button asChild size="sm">
          <Link href="/booking" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New booking
          </Link>
        </Button>
      }
    >
      <PillTabs
        items={[
          { value: "upcoming", label: "Upcoming", count: upcoming.length },
          { value: "past", label: "Past", count: past.length },
        ]}
        value={activeTab}
        onChange={(v) => setActiveTab(v as "upcoming" | "past")}
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      ) : error ? (
        <EmptyState
          title="Could not load bookings"
          description={error}
          action={
            <Button variant="outline" size="sm" onClick={fetchBookings}>
              Retry
            </Button>
          }
        />
      ) : displayed.length === 0 ? (
        <EmptyState
          title={activeTab === "upcoming" ? "No upcoming bookings" : "No past bookings"}
          description={
            activeTab === "upcoming" ? "Book a workspace to get started." : undefined
          }
          action={
            activeTab === "upcoming" ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/booking">Book a workspace</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataList>
          {displayed.map((booking) => (
            <DataListRow
              key={booking.id}
              href={`/dashboard/bookings/${booking.id}`}
              className={activeTab === "past" ? "opacity-80" : undefined}
            >
              <div className="flex w-10 shrink-0 flex-col items-center rounded-md border border-border py-1">
                <span className="text-sm font-semibold leading-none">
                  {format(new Date(booking.date), "d")}
                </span>
                <span className="text-[10px] font-medium uppercase text-muted-foreground">
                  {format(new Date(booking.date), "MMM")}
                </span>
              </div>
              <DataListPrimary
                title={booking.spaceAsset?.name || resourceLabel(booking.resourceType)}
                subtitle={`${booking.startTime}${booking.endTime ? ` – ${booking.endTime}` : ""}`}
              />
              <div className="hidden items-center gap-3 sm:flex">
                <StatusDot label={booking.status} variant={statusVariant(booking.status)} />
                <DataListMeta mono>
                  KES {Number(booking.totalPrice).toLocaleString()}
                </DataListMeta>
              </div>
            </DataListRow>
          ))}
        </DataList>
      )}
    </PageShell>
  )
}
