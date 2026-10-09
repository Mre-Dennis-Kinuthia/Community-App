"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { Building2, Calendar, Clock, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MobileBreadcrumbsHidden } from "@/components/mobile/mobile-page-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BookingDetails {
  id: string
  resourceType: string
  date: string
  startTime: string
  endTime: string | null
  totalPrice: number
}

function resourceName(type: string) {
  switch (type) {
    case "hot-desk":
      return "Day Pass"
    case "meeting-room":
      return "Meeting Room"
    case "private-office":
      return "Private Office"
    default:
      return type
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
  }
}

function FrontDeskPaymentContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("id")
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(Boolean(bookingId))

  useEffect(() => {
    if (!bookingId) return
    let cancelled = false
    async function load() {
      try {
        const response = await fetch(`/api/bookings?id=${encodeURIComponent(bookingId!)}`, {
          credentials: "include",
        })
        if (!response.ok) return
        const data = await response.json()
        if (!cancelled) setBooking(data.booking ?? null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [bookingId])

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-lg space-y-6 pb-10">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs
            items={[
              { label: "Bookings", href: "/dashboard/bookings" },
              { label: "Front desk" },
            ]}
          />
        </MobileBreadcrumbsHidden>

        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Pay at the front desk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This booking is paid in the space, at the front desk, when you arrive. Online payment is not available.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">How to pay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Come to Impact Hub Nairobi and pay the amount due at reception.</p>
            <p>Bring this booking reference so the front desk can match your payment.</p>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : booking ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{resourceName(booking.resourceType)}</span>
              </div>
              <div className="flex gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{format(new Date(booking.date), "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>
                  {booking.startTime}
                  {booking.endTime ? ` – ${booking.endTime}` : ""}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 px-3 py-2.5">
                <span className="text-muted-foreground">Amount due</span>
                <span className="font-semibold tabular-nums">
                  KES {Number(booking.totalPrice).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Reference: {booking.id}</p>
            </CardContent>
          </Card>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          {bookingId ? (
            <Button asChild className="flex-1">
              <Link href={`/dashboard/bookings/${bookingId}`}>View booking</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard/bookings">My bookings</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function FrontDeskPaymentPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </DashboardLayout>
      }
    >
      <FrontDeskPaymentContent />
    </Suspense>
  )
}
