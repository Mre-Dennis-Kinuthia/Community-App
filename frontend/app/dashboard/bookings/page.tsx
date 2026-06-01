"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Plus } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { PillTabs } from "@/components/mobile/pill-tabs"
import { MobilePageHeader } from "@/components/mobile/mobile-page-shell"

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
    } catch (err) {
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

  const statusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const upcoming = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(b.date) >= new Date()
  )
  const past = bookings.filter(
    (b) => b.status === "cancelled" || new Date(b.date) < new Date()
  )

  const displayed = activeTab === "upcoming" ? upcoming : past

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <Button variant="ghost" size="icon" className="shrink-0 mt-0.5" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <MobilePageHeader
            title="My bookings"
            description="View and manage your workspace bookings"
          />
        </div>
        <Button asChild size="sm" className="shrink-0 rounded-lg">
          <Link href="/booking" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New</span>
          </Link>
        </Button>
      </div>

      <PillTabs
        items={[
          { value: "upcoming", label: "Upcoming", count: upcoming.length },
          { value: "past", label: "Past", count: past.length },
        ]}
        value={activeTab}
        onChange={(v) => setActiveTab(v as "upcoming" | "past")}
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border py-8 text-center">
          <p className="mb-2 text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchBookings}>
            Retry
          </Button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 py-12 text-center text-muted-foreground">
          <p className="mb-3">
            {activeTab === "upcoming" ? "No upcoming bookings." : "No past bookings."}
          </p>
          {activeTab === "upcoming" && (
            <Button asChild variant="outline" size="sm">
              <Link href="/booking">Book a workspace</Link>
            </Button>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {displayed.map((booking) => (
            <li key={booking.id}>
              <Link
                href={`/dashboard/bookings/${booking.id}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-border/80 p-3.5 transition-colors hover:bg-muted/30 active:bg-muted/40",
                  activeTab === "past" && "opacity-80"
                )}
              >
                <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-muted/40 py-1.5">
                  <span className="text-lg font-semibold leading-none">{format(new Date(booking.date), "d")}</span>
                  <span className="text-[10px] font-medium uppercase text-muted-foreground">
                    {format(new Date(booking.date), "MMM")}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{resourceLabel(booking.resourceType)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {booking.startTime}
                    {booking.endTime ? ` – ${booking.endTime}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant={statusVariant(booking.status)} className="text-[10px]">
                    {booking.status}
                  </Badge>
                  <span className="text-xs font-medium tabular-nums">
                    KES {Number(booking.totalPrice).toLocaleString()}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
