"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/lib/toast"
import { Phone, Loader2, ArrowLeft, Calendar, Clock, Building2 } from "lucide-react"
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
  addOns: string[]
  workspaceId: string
  meetingRoomHours?: number
  meetingRoomCapacity?: "1-4" | "1-10" | "1-35"
}

function getResourceName(type: string) {
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

function getDurationLabel(duration: string, meetingRoomHours?: number) {
  if (typeof meetingRoomHours === "number" && meetingRoomHours > 0) {
    return `${meetingRoomHours} ${meetingRoomHours === 1 ? "hour" : "hours"}`
  }
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

export default function BookingPaymentPage() {
  const router = useRouter()
  const [pending, setPending] = useState<PendingBookingPayload | null>(null)
  const [mpesaPhone, setMpesaPhone] = useState("")
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
        ...(pending.meetingRoomHours && { meetingRoomHours: pending.meetingRoomHours }),
        ...(pending.meetingRoomCapacity && { meetingRoomCapacity: pending.meetingRoomCapacity }),
      }),
    })

    const bookingData = await bookingRes.json()
    if (!bookingRes.ok) {
      throw new Error(bookingData.error || "Failed to create booking")
    }

    return bookingData.booking as { id: string }
  }

  const handleConfirmWithoutPayment = async () => {
    if (!pending) return

    setIsProcessing(true)
    try {
      const booking = await createBooking()

      sessionStorage.removeItem(PENDING_BOOKING_KEY)
      setIsRedirecting(true)
      toast.success("Booking confirmed", "Your booking has been created. Payment status is pending.")
      router.replace(`/booking/success?id=${booking.id}`)
    } catch (err) {
      console.error("[BOOKING CONFIRM WITHOUT PAYMENT]", err)
      toast.error(
        "Booking failed",
        err instanceof Error ? err.message : "Please try again or contact support."
      )
      setIsProcessing(false)
    }
  }

  const handlePayAndConfirm = async () => {
    if (!pending) return

    const phone = mpesaPhone.trim().replace(/\D/g, "")
    if (phone.length < 10) {
      toast.error("Invalid phone", "Please enter a valid M-Pesa phone number (e.g. 07XX XXX XXX).")
      return
    }

    setIsProcessing(true)
    try {
      const mpesaRes = await fetch("/api/billing/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone.startsWith("254") ? phone : `254${phone.replace(/^0/, "")}`,
          amount: Math.round(pending.totalPrice),
          description: `Workspace booking - ${getResourceName(pending.resourceType)}, ${format(new Date(pending.date), "d MMM yyyy")}`,
        }),
      })
      const mpesaData = await mpesaRes.json()
      if (!mpesaRes.ok) {
        throw new Error(mpesaData.error || "Payment initiation failed")
      }

      const booking = await createBooking()

      sessionStorage.removeItem(PENDING_BOOKING_KEY)
      setIsRedirecting(true)
      toast.success("Booking confirmed", "Check your phone to complete M-Pesa payment.")
      router.replace(`/booking/success?id=${booking.id}`)
    } catch (err) {
      console.error("[BOOKING PAYMENT]", err)
      toast.error(
        "Payment or booking failed",
        err instanceof Error ? err.message : "Please try again or contact support."
      )
      setIsProcessing(false)
    }
  }

  if (pending === null && !isRedirecting) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  const bookingDate = pending ? new Date(pending.date) : null

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-32 md:pb-12">
        <Breadcrumbs items={[{ label: "Book Workspace", href: "/booking" }, { label: "Payment" }]} />

        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Confirm your booking</h1>
            <p className="text-muted-foreground mt-1">
              Confirm now without payment, or pay with M-Pesa (optional).
            </p>
          </div>

          {pending && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking summary</CardTitle>
                  <CardDescription>Review before confirming</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{getResourceName(pending.resourceType)}</span>
                  </div>
                  {bookingDate && (
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(bookingDate, "EEEE, MMMM d, yyyy")}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {pending.startTime} · {getDurationLabel(pending.duration, pending.meetingRoomHours)}
                    </span>
                  </div>
                  <div className="pt-3 border-t flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="text-lg font-semibold">
                      KES {pending.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Confirm & payment</CardTitle>
                  <CardDescription>
                    You can secure your booking now. Payment status will remain pending unless you complete M-Pesa.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleConfirmWithoutPayment}
                    disabled={isProcessing || isRedirecting}
                  >
                    {isProcessing || isRedirecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Confirming booking...
                      </>
                    ) : (
                      <>
                        Confirm booking (no payment)
                      </>
                    )}
                  </Button>

                  <div className="pt-4 border-t space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Optional: Pay with M-Pesa</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter your number to receive an STK push to complete payment.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mpesa-phone">M-Pesa phone number</Label>
                      <Input
                        id="mpesa-phone"
                        placeholder="07XX XXX XXX"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        disabled={isProcessing || isRedirecting}
                      />
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={handlePayAndConfirm}
                      disabled={isProcessing || isRedirecting}
                    >
                      {isProcessing || isRedirecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isRedirecting ? "Confirming booking..." : "Sending STK push..."}
                        </>
                      ) : (
                        <>
                          <Phone className="mr-2 h-4 w-4" />
                          Pay KES {pending.totalPrice.toLocaleString()}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Button variant="ghost" asChild>
                  <Link href="/booking" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to booking
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Mobile sticky CTA */}
      {pending && !isRedirecting && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-elevated pb-[env(safe-area-inset-bottom)] md:hidden">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted-foreground">
                {bookingDate ? format(bookingDate, "EEE, MMM d") : null} · {pending.startTime}
              </p>
              <p className="text-base font-semibold">
                KES {pending.totalPrice.toLocaleString()}
              </p>
            </div>
            <Button
              size="lg"
              className="min-w-[120px]"
              onClick={handleConfirmWithoutPayment}
              disabled={isProcessing || isRedirecting}
            >
              {isProcessing || isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
