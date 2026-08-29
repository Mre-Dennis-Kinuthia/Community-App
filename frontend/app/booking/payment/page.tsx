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
import { Loader2, ArrowLeft, Calendar, Clock, Building2, CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { verifyBookingSlotAvailable } from "@/lib/booking-verify-client"
import { meetingRoomPackageById, type MeetingRoomPackageId } from "@/lib/workspace-pricing"

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
  meetingRoomCapacity?: MeetingRoomPackageId | "1-4" | "1-10" | "1-35"
  conferencePax?: number
}

function getResourceName(type: string, meetingRoomCapacity?: string) {
  switch (type) {
    case "hot-desk":
      return "Day Pass"
    case "meeting-room":
      return meetingRoomPackageById(meetingRoomCapacity)?.name ?? "Meeting Room"
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

type AvailabilityStatus = "checking" | "available" | "unavailable"

export default function BookingPaymentPage() {
  const router = useRouter()
  const [pending, setPending] = useState<PendingBookingPayload | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>("checking")
  const [availabilityReason, setAvailabilityReason] = useState<string | null>(null)

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

  const runAvailabilityCheck = async (payload: PendingBookingPayload) => {
    setAvailabilityStatus("checking")
    setAvailabilityReason(null)

    const result = await verifyBookingSlotAvailable({
      resourceType: payload.resourceType,
      date: payload.date,
      startTime: payload.startTime,
      duration: payload.duration,
      workspaceId: payload.workspaceId,
      ...(payload.spaceAssetId && { spaceAssetId: payload.spaceAssetId }),
      ...(payload.meetingRoomHours && { meetingRoomHours: payload.meetingRoomHours }),
    })

    if (result.available) {
      setAvailabilityStatus("available")
      return { available: true as const }
    }

    const reason = result.reason || "This time slot is no longer available."
    setAvailabilityStatus("unavailable")
    setAvailabilityReason(reason)
    return { available: false as const, reason }
  }

  useEffect(() => {
    if (!pending) return
    void runAvailabilityCheck(pending)
  }, [pending])

  const ensureAvailability = async () => {
    if (!pending) {
      return { available: false as const, reason: "Missing booking details" }
    }
    return runAvailabilityCheck(pending)
  }

  const createBooking = async () => {
    if (!pending) throw new Error("Missing booking details")

    const check = await ensureAvailability()
    if (!check.available) {
      throw new Error(check.reason)
    }

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
        ...(pending.conferencePax && { conferencePax: pending.conferencePax }),
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

  const handleSubmitRequest = async () => {
    if (!pending) return
    setIsProcessing(true)
    try {
      const booking = await createBooking()
      sessionStorage.removeItem(PENDING_BOOKING_KEY)
      setIsRedirecting(true)
      toast.success("Request submitted", "The hub team will confirm availability shortly.")
      router.replace(`/booking/success?id=${booking.id}`)
    } catch (err) {
      toast.error("Booking failed", err instanceof Error ? err.message : "Please try again.")
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
  const busy = isProcessing || isRedirecting || availabilityStatus === "checking"
  const canCheckout = availabilityStatus === "available" && !busy
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
          <p className="mt-1 text-sm text-muted-foreground">
            Review your details. The calendar check shows the slot is free; the hub team still confirms availability
            {isFree ? "." : ". You’ll be asked to pay after they confirm."}
          </p>
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
                  <span>{getResourceName(pending.resourceType, pending.meetingRoomCapacity)}</span>
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
                <CardTitle className="text-base">Availability</CardTitle>
              </CardHeader>
              <CardContent>
                {availabilityStatus === "checking" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirming your slot is still available…
                  </div>
                )}
                {availabilityStatus === "available" && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    This slot is free on the calendar. The hub team will still confirm availability.
                  </div>
                )}
                {availabilityStatus === "unavailable" && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm text-destructive">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{availabilityReason || "This time slot is no longer available."}</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/booking">Choose another time</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => void handleSubmitRequest()}
                  disabled={!canCheckout}
                >
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    "Submit request"
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {availabilityStatus === "available"
                    ? isFree
                      ? "No payment required. The hub team will confirm availability."
                      : "You’ll pay after the hub team confirms this slot is available."
                    : "Availability must be checked on the calendar before you can submit."}
                </p>
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
              onClick={() => void handleSubmitRequest()}
              disabled={!canCheckout}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
