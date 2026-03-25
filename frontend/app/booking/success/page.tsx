"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, CalendarIcon, Clock, Building2, ArrowRight, Loader2 } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface BookingDetails {
  id: string
  resourceType: string
  date: string
  startTime: string
  endTime: string
  duration: string
  totalPrice: number
  status: string
  paymentStatus?: string
  createdAt: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get("id")
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided")
      setLoading(false)
      return
    }

    // Fetch booking details
    async function fetchBooking() {
      try {
        const response = await fetch(`/api/bookings?id=${bookingId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch booking details")
        }
        const data = await response.json()
        setBooking(data.booking)
      } catch (err) {
        console.error("Error fetching booking:", err)
        setError(err instanceof Error ? err.message : "Failed to load booking details")
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  const getResourceName = (type: string) => {
    switch (type) {
      case "hot-desk":
        return "Hot Desk"
      case "meeting-room":
        return "Meeting Room"
      case "private-office":
        return "Private Office"
      default:
        return type
    }
  }

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case "hourly":
        return "1 Hour"
      case "half-day":
        return "Half Day (4 Hours)"
      case "full-day":
        return "Full Day (8 Hours)"
      case "monthly":
        return "Monthly"
      default:
        return duration
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading booking details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !booking) {
    return (
      <DashboardLayout>
        <div className="space-y-8 pb-24 lg:pb-8">
          <Breadcrumbs items={[{ label: "Booking", href: "/booking" }, { label: "Success" }]} />
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-destructive mb-4">{error || "Booking not found"}</p>
                <Button asChild>
                  <Link href="/booking">Back to Booking</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const bookingDate = new Date(booking.date)
  const isPaymentPending = !!booking.paymentStatus && booking.paymentStatus.toLowerCase() !== "paid"

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-24 lg:pb-8">
        <Breadcrumbs items={[{ label: "Booking", href: "/booking" }, { label: "Success" }]} />

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Header */}
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-1">
                    {isPaymentPending ? "Booking Confirmed! (Payment Pending)" : "Booking Confirmed!"}
                  </h1>
                  <p className="text-muted-foreground">
                    {isPaymentPending
                      ? "Your workspace booking has been created. Payment status is pending."
                      : "Your workspace booking has been successfully created."}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                Booking ID: {booking.id.substring(0, 8).toUpperCase()}
              </Badge>
              {isPaymentPending && booking.paymentStatus && (
                <Badge variant="outline" className="ml-3">
                  Payment: {booking.paymentStatus}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>Your workspace reservation information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Resource Type</p>
                    <p className="font-medium">{getResourceName(booking.resourceType)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{format(bookingDate, "EEEE, MMMM d, yyyy")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{getDurationLabel(booking.duration)}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    KES {booking.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You'll receive a confirmation email with all the details of your booking.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Arrive at Impact Hub Nairobi on your booked date and time</li>
                <li>Check in at the reception desk</li>
                <li>Enjoy your workspace!</li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/booking">Book Another Space</Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DashboardLayout>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
