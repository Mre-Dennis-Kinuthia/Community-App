"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MobileBreadcrumbsHidden } from "@/components/mobile/mobile-page-shell"
import { BookingProgress } from "@/components/booking/booking-progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/lib/toast"
import {
  Phone,
  Loader2,
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  ShieldCheck,
  ChevronDown,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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
  pastriesPax?: number
  meetingRoomHours?: number
  meetingRoomCapacity?: "1-4" | "1-10" | "1-35"
}

function getResourceName(type: string) {
  switch (type) {
    case "hot-desk":
      return "Hot desk"
    case "meeting-room":
      return "Meeting room"
    case "private-office":
      return "Private office"
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
      return "1 hour"
    case "half-day":
      return "Half day"
    case "full-day":
      return "Full day"
    case "monthly":
      return "Monthly"
    default:
      return duration
  }
}

const CHECKOUT_STEPS = [
  { id: "space" as const, label: "Book" },
  { id: "checkout" as const, label: "Checkout" },
]

export default function BookingPaymentPage() {
  const router = useRouter()
  const [pending, setPending] = useState<PendingBookingPayload | null>(null)
  const [mpesaPhone, setMpesaPhone] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showMpesa, setShowMpesa] = useState(false)

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

    return bookingData.booking as { id: string }
  }

  const handleConfirmWithoutPayment = async () => {
    if (!pending) return

    setIsProcessing(true)
    try {
      const booking = await createBooking()
      sessionStorage.removeItem(PENDING_BOOKING_KEY)
      setIsRedirecting(true)
      toast.success("Booking confirmed", "You're all set. Payment can be completed later.")
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
      toast.error("Invalid phone", "Enter a valid M-Pesa number (e.g. 07XX XXX XXX).")
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
      const stubNote =
        mpesaData.launchMode === "stub"
          ? "Payment is pending — M-Pesa STK is not live yet."
          : "Check your phone to complete M-Pesa."
      toast.success("Booking confirmed", stubNote)
      router.replace(`/booking/success?id=${booking.id}`)
    } catch (err) {
      console.error("[BOOKING PAYMENT]", err)
      toast.error(
        "Payment or booking failed",
        err instanceof Error ? err.message : "Please try again."
      )
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

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-4xl space-y-5 overflow-x-hidden pb-[calc(8.5rem+env(safe-area-inset-bottom))] md:space-y-6 md:pb-10">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs
            items={[
              { label: "Book workspace", href: "/booking" },
              { label: "Checkout" },
            ]}
          />
        </MobileBreadcrumbsHidden>

        <BookingProgress steps={CHECKOUT_STEPS} currentStepId="checkout" />

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-9 px-2" asChild>
            <Link href="/booking">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Edit booking
            </Link>
          </Button>
        </div>

        {pending && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:gap-8 lg:items-start">
            {/* Order summary */}
            <section className="rounded-xl border border-border/80 bg-card">
              <div className="border-b border-border px-4 py-3 md:px-5">
                <h1 className="text-lg font-semibold tracking-tight md:text-xl">Review your booking</h1>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  Confirm to reserve your space. Payment is optional at launch.
                </p>
              </div>
              <div className="space-y-4 p-4 md:p-5">
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{getResourceName(pending.resourceType)}</p>
                      {pending.meetingRoomCapacity ? (
                        <p className="text-xs text-muted-foreground">
                          {pending.meetingRoomCapacity} people
                        </p>
                      ) : null}
                    </div>
                  </li>
                  {bookingDate ? (
                    <li className="flex gap-3">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{format(bookingDate, "EEEE, MMMM d, yyyy")}</span>
                    </li>
                  ) : null}
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>
                      {pending.startTime} · {getDurationLabel(pending.duration, pending.meetingRoomHours)}
                    </span>
                  </li>
                </ul>

                <Separator />

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="tabular-nums">
                      KES {(pending.basePrice + pending.addOnsPrice).toLocaleString()}
                    </span>
                  </div>
                  {pending.addOns.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Includes {pending.addOns.length} add-on
                      {pending.addOns.length !== 1 ? "s" : ""}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-baseline justify-between rounded-lg bg-muted/40 px-3 py-2.5">
                  <span className="font-medium">Total due</span>
                  <span className="text-xl font-bold tabular-nums text-primary">
                    KES {pending.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            {/* Checkout actions */}
            <aside className="lg:sticky lg:top-24">
              <div className="rounded-xl border border-border/80 bg-card p-4 md:p-5 space-y-4">
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold">Complete reservation</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your slot is held once you confirm.
                  </p>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleConfirmWithoutPayment}
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming…
                    </>
                  ) : (
                    "Confirm reservation"
                  )}
                </Button>

                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
                  <p>No charge at confirm — pay on-site or via M-Pesa when ready.</p>
                </div>

                <Separator />

                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left text-sm font-medium"
                  onClick={() => setShowMpesa((v) => !v)}
                >
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Pay with M-Pesa (optional)
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      showMpesa && "rotate-180"
                    )}
                  />
                </button>

                {showMpesa ? (
                  <div className="space-y-3 pt-1">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      STK push may be in test mode. Your booking is still created if payment stays pending.
                    </p>
                    <div className="space-y-1.5">
                      <Label htmlFor="mpesa-phone" className="text-xs">
                        M-Pesa number
                      </Label>
                      <Input
                        id="mpesa-phone"
                        placeholder="07XX XXX XXX"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        disabled={busy}
                        autoComplete="tel"
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handlePayAndConfirm}
                      disabled={busy}
                    >
                      {busy ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Phone className="mr-2 h-4 w-4" />
                      )}
                      Pay KES {pending.totalPrice.toLocaleString()}
                    </Button>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        )}
      </div>

      {pending && !isRedirecting && (
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-border bg-background/95 shadow-sm backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted-foreground">
                {bookingDate ? format(bookingDate, "EEE, MMM d") : null} · {pending.startTime}
              </p>
              <p className="text-base font-bold tabular-nums">
                KES {pending.totalPrice.toLocaleString()}
              </p>
            </div>
            <Button
              size="lg"
              className="shrink-0"
              onClick={handleConfirmWithoutPayment}
              disabled={busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
