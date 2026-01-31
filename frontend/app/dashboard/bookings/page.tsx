"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Loader2, Plus } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              My Bookings
            </h1>
            <p className="text-muted-foreground text-sm">
              View and manage your workspace bookings
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/booking" className="gap-2">
            <Plus className="h-4 w-4" />
            New booking
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All bookings</CardTitle>
          <CardDescription>
            {upcoming.length} upcoming · {past.length} past
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading...
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchBookings}>
                Retry
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">You don&apos;t have any bookings yet.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/booking">Book a workspace</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {upcoming.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Upcoming</h3>
                  <ul className="space-y-2">
                    {upcoming.map((booking) => (
                      <li key={booking.id}>
                        <Link
                          href={`/dashboard/bookings/${booking.id}`}
                          className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                              <p className="font-medium">{resourceLabel(booking.resourceType)}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(booking.date), "EEE, MMM d, yyyy")} · {booking.startTime}
                                {booking.endTime ? ` – ${booking.endTime}` : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
                              <span className="text-sm font-medium">
                                KES {Number(booking.totalPrice).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Past</h3>
                  <ul className="space-y-2">
                    {past.map((booking) => (
                      <li key={booking.id}>
                        <Link
                          href={`/dashboard/bookings/${booking.id}`}
                          className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors opacity-80"
                        >
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div>
                              <p className="font-medium">{resourceLabel(booking.resourceType)}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(booking.date), "EEE, MMM d, yyyy")} · {booking.startTime}
                                {booking.endTime ? ` – ${booking.endTime}` : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
                              <span className="text-sm text-muted-foreground">
                                KES {Number(booking.totalPrice).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
