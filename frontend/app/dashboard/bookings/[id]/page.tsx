"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { MobilePageHeader } from "@/components/mobile/mobile-page-shell"

interface Booking {
  id: string
  resourceType: string
  date: string
  startTime: string
  endTime: string | null
  duration: string
  status: string
  paymentStatus?: string
  basePrice: number
  addOnsPrice?: number
  totalPrice: number
  notes?: string | null
  createdAt: string
}

export default function DashboardBookingDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function fetchBooking() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/bookings?id=${encodeURIComponent(id)}`, {
          credentials: "include",
        })
        if (!response.ok) {
          if (response.status === 404) {
            setError("Booking not found.")
            setBooking(null)
            return
          }
          if (response.status === 401 || response.status === 403) {
            setError("You don't have access to this booking.")
            setBooking(null)
            return
          }
          throw new Error("Failed to load booking")
        }
        const data = await response.json()
        if (!cancelled) setBooking(data.booking)
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load booking. Please try again.")
          setBooking(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchBooking()
    return () => {
      cancelled = true
    }
  }, [id])

  const resourceLabel = (type: string) =>
    type
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading booking...
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-2">{error ?? "Booking not found."}</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/bookings">Back to My Bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-start gap-2">
        <Button variant="ghost" size="icon" className="shrink-0 mt-0.5" asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <MobilePageHeader
          title={resourceLabel(booking.resourceType)}
          description={format(new Date(booking.date), "EEEE, MMMM d, yyyy")}
        />
      </div>

      <div className="rounded-xl border border-border/80 bg-card p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Booking details</h2>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant(booking.status)} className="text-[10px]">
              {booking.status}
            </Badge>
            {booking.paymentStatus && (
              <Badge variant="outline" className="text-[10px]">
                {booking.paymentStatus}
              </Badge>
            )}
          </div>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">Reference: {booking.id}</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2.5">
            <span className="text-xs text-muted-foreground">Date</span>
            <span className="text-sm font-medium">{format(new Date(booking.date), "EEE, MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2.5">
            <span className="text-xs text-muted-foreground">Time</span>
            <span className="text-sm font-medium">
              {booking.startTime}
              {booking.endTime ? ` – ${booking.endTime}` : ""} ({booking.duration})
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2.5">
            <span className="text-xs text-muted-foreground">Resource</span>
            <span className="text-sm font-medium">{resourceLabel(booking.resourceType)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2.5">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-sm font-semibold tabular-nums">
              KES {Number(booking.totalPrice).toLocaleString()}
            </span>
          </div>
        </div>
        {booking.notes && (
          <div className="mt-4 rounded-lg border border-border/60 px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
            <p className="text-sm">{booking.notes}</p>
          </div>
        )}
        <p className="mt-4 border-t border-border pt-4 text-[11px] text-muted-foreground">
          Booked on {format(new Date(booking.createdAt), "MMM d, yyyy 'at' HH:mm")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/bookings">Back to bookings</Link>
        </Button>
        {booking.status !== "cancelled" && new Date(booking.date) >= new Date() && (
          <Button asChild size="sm">
            <Link href="/booking">Book again</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
