"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Loader2 } from "lucide-react"
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {resourceLabel(booking.resourceType)}
          </h1>
          <p className="text-muted-foreground text-sm">
            {format(new Date(booking.date), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>Booking details</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
              {booking.paymentStatus && (
                <Badge variant="outline">{booking.paymentStatus}</Badge>
              )}
            </div>
          </div>
          <CardDescription>Reference: {booking.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="font-medium">{format(new Date(booking.date), "EEE, MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Time</p>
              <p className="font-medium">
                {booking.startTime}
                {booking.endTime ? ` – ${booking.endTime}` : ""} ({booking.duration})
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resource</p>
              <p className="font-medium">{resourceLabel(booking.resourceType)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="font-medium">KES {Number(booking.totalPrice).toLocaleString()}</p>
            </div>
          </div>
          {booking.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{booking.notes}</p>
            </div>
          )}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Booked on {format(new Date(booking.createdAt), "MMM d, yyyy 'at' HH:mm")}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard/bookings">Back to My Bookings</Link>
        </Button>
        {booking.status !== "cancelled" && new Date(booking.date) >= new Date() && (
          <Button asChild>
            <Link href="/booking">Book again</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
