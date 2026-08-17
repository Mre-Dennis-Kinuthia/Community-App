"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MobileBreadcrumbsHidden } from "@/components/mobile/mobile-page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/lib/toast"
import { Loader2, ArrowLeft, Calendar, Clock, Building2 } from "lucide-react"
import { format } from "date-fns"

const PENDING_BOOKING_KEY = "pendingWorkspaceBooking"

export interface PendingBookingPayload {
  resourceType: string
  date: string
  startTime: string
  duration: string
  basePrice: number
  addOnsPrice: number
  totalPrice: number
  listPrice?: number
  membershipDiscount?: number
  addOns: string[]
  workspaceId: string
  spaceAssetId?: string
  pastriesPax?: number
  meetingRoomHours?: number
  meetingRoomCapacity?: "1-4" | "1-10" | "1-35"
}

function getResourceName(type: string) {
  switch (type) {
    case "hot-desk":
      return "Hot Desk"
    case "meeting-room":
      return "Meeting Room"
    default:
      return type
  }
}

function getDurationLabel(duration: string, meetingRoomHours?: number) {
  if (typeof meetingRoomHours === "number" && meetingRoomHours > 0) {
    return `${meetingRoomHours} ${meetingRoomHours === 1 ? "hour" : "hours"}`
  }
  switch (duration) {
    case "full-day":
      return "Full day"
    case "half-day":
      return "Half day"
    default:
      return duration
  }
}

export default function BookingPaymentPage() {
  const router = useRouter()
  const [pending, setPending] = useState<PendingBookingPayload | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = sessionStorage.getItem(PENDING_BOOKING_KEY)
      if (!raw) {
        router.replace("/booking")
        return
      }
      const data = JSON.parse(raw) as PendingBookingPayload
      if (!data.resourceType || !data.date || !data.startTime || data.totalPrice == null) {
        sessionStorage.removeItem(PENDING_BOOKING_KEY)
        router.replace("/booking")
        return
      }
      setPending(data)
    } catch {
      sessionStorage.removeItem(PENDING_BOOKING_KEY)
      router.replace("/booking")
    }
  }, [router])

  const createBooking = async () => {
    if (!pending) throw new Error("Missing booking details")

    const bookingRes = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resourceType: pending.resourceType,
        date: pending.date,
        startTime: pending.startTime,
        duration: pending.duration,
        basePrice: pending.basePrice,
        addOnsPrice: pending.addOnsPrice,
        totalPrice: pending.totalPrice,
        addOns: pending.addOns,
        workspaceId: pending.workspaceId,
        ...(pending.spaceAssetId && { spaceAssetId: pending.spaceAssetId }),
        ...(pending.pastriesPax && { pastriesPax: pending.pastriesPax }),
        ...(pending.meetingRoomHours && { meetingRoomHours: pending.meetingRoomHours }),
        ...(pending.meetingRoomCapacity && { meetingRoomCapacity: pending.meetingRoomCapacity }),
      }),
    })

    const bookingData = await bookingRes.json()
    if (!bookingRes.ok) {
      const details = typeof bookingData?.details === "string" ? bookingData.details : undefined
      const msg = bookingData?.error || "Failed to create booking"
      throw new Error(details ? `${msg}: ${details}` : msg)
    }

    return bookingData.booking as { id: string; totalPrice: number; paymentStatus: string }
  }

  const handleConfirmFree = async () => {
    if (!pending) return
    setIsProcessing(true)
    try {
      const booking = await createBooking()
      sessionStorage.removeItem(PENDING_BOOKING_KEY)
      setIsRedirecting(true)
      toast.success("Booking confirmed", "Your reservation is confirmed.")
      router.replace(`/booking/success?id=${booking.id}`)
    } catch (err) {
      toast.error("Booking failed", err instanceof Error ? err.message : "Please try again.")
      setIsProcessing(false)
    }
  }

  const handlePayWithPaystack = async () => {
    if (!pending) return
    setIsProcessing(true)
    try {
      const booking = await createBooking()
      const payRes = await fetch("/api/billing/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "booking", bookingId: booking.id }),
      })
      const payData = await payRes.json()
      if (!payRes.ok) throw new Error(payData.error || "Could not start payment")
      if (!payData.authorizationUrl) throw new Error("Missing Paystack checkout URL")

      sessionStorage.removeItem(PENDING_BOOKING_KEY)
      setIsRedirecting(true)
      window.location.href = payData.authorizationUrl as string
    } catch (err) {
      toast.error("Payment failed", err instanceof Error ? err.message : "Please try again.")
      setIsProcessing(false)
    }
  }

  if (pending === null && !isRedirecting) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  const bookingDate = pending ? new Date(pending.date) : null
  const busy = isProcessing || isRedirecting
  const isFree = (pending?.totalPrice ?? 0) <= 0

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-lg space-y-6 overflow-x-hidden pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:pb-10">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs
            items={[
              { label: "Book Workspace", href: "/booking" },
              { label: "Checkout" },
            ]}
          />
        </MobileBreadcrumbsHidden>

        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Checkout</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review and confirm your booking.</p>
        </div>

        {pending && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Booking details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{getResourceName(pending.resourceType)}</span>
                </div>
                {bookingDate && (
                  <div className="flex gap-3">
                    <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{format(bookingDate, "EEEE, MMMM d, yyyy")}</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>
                    {pending.startTime} · {getDurationLabel(pending.duration, pending.meetingRoomHours)}
                  </span>
                </div>
                <Separator />
                {typeof pending.listPrice === "number" && pending.listPrice > pending.totalPrice ? (
                  <>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="tabular-nums">KES {pending.listPrice.toLocaleString()}</span>
                    </div>
                    {(pending.membershipDiscount ?? 0) > 0 ? (
                      <div className="flex justify-between text-sm text-primary">
                        <span>Membership benefit</span>
                        <span className="tabular-nums">
                          −KES {(pending.membershipDiscount ?? 0).toLocaleString()}
                        </span>
                      </div>
                    ) : null}
                  </>
                ) : null}
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {isFree ? "Free" : `KES ${pending.totalPrice.toLocaleString()}`}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isFree ? (
                  <>
                    <Button className="w-full" size="lg" onClick={() => void handleConfirmFree()} disabled={busy}>
                      {busy ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Confirming…
                        </>
                      ) : (
                        "Confirm booking"
                      )}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">No payment required.</p>
                  </>
                ) : (
                  <>
                    <Button className="w-full" size="lg" onClick={() => void handlePayWithPaystack()} disabled={busy}>
                      {busy ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Redirecting…
                        </>
                      ) : (
                        "Pay with Paystack"
                      )}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Card or M-Pesa via Paystack. Your booking is confirmed after payment.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Button variant="ghost" className="w-full" asChild>
              <Link href="/booking">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Edit booking
              </Link>
            </Button>
          </>
        )}
      </div>

      {pending && !isRedirecting && (
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-border bg-background lg:hidden">
          <div className="mx-auto flex h-[4.25rem] max-w-lg items-center justify-between gap-3 px-4">
            <p className="text-base font-semibold tabular-nums">
              {isFree ? "Free" : `KES ${pending.totalPrice.toLocaleString()}`}
            </p>
            <Button
              size="lg"
              className="h-11 min-w-[7.5rem]"
              onClick={() => void (isFree ? handleConfirmFree() : handlePayWithPaystack())}
              disabled={busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : isFree ? "Confirm" : "Pay"}
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
