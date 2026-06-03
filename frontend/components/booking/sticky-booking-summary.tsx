"use client"

import { CheckoutGuideBubble } from "@/components/booking/checkout-guide-bubble"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { ResourceType } from "./resource-selector"
import type { BookingDuration } from "./time-selector"

interface BookingSummary {
  date: Date | null
  time: string | null
  duration: BookingDuration
  resourceType: ResourceType | null
  totalPrice: number
  currency: string
}

interface StickyBookingSummaryProps {
  summary: BookingSummary
  onConfirm: () => void
  isBooking: boolean
  isValid: boolean
  highlight?: boolean
  guideReady?: boolean
  guideHint?: string | null
  onPointToCheckout?: () => void
}

/** Fixed-height mobile checkout bar — always visible during booking to prevent layout jump. */
export function StickyBookingSummary({
  summary,
  onConfirm,
  isBooking,
  isValid,
  highlight = false,
  guideReady = false,
  guideHint = null,
  onPointToCheckout,
}: StickyBookingSummaryProps) {
  const showGuide = guideReady || Boolean(guideHint)
  const dateLabel =
    summary.date != null ? format(summary.date, "MMM d") : "Select date & time"
  const timeLabel =
    summary.time ||
    (summary.resourceType === "hot-desk" ? "Full day" : summary.resourceType ? "—" : "")

  return (
    <div
      className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 lg:hidden"
      role="region"
      aria-label="Booking total"
    >
      {showGuide ? (
        <div className="border-t border-border bg-background/95 px-3 pb-2 pt-3 backdrop-blur-sm">
          <CheckoutGuideBubble
            ready={guideReady}
            hint={guideHint}
            onCheckout={onConfirm}
            onPointToCheckout={onPointToCheckout}
            tail="down"
          />
        </div>
      ) : null}
      <div
        id="checkout-cta"
        className={cn(
          "mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-3 border-t border-border bg-background px-4 transition-shadow",
          highlight && "ring-2 ring-inset ring-primary shadow-md"
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">
            {dateLabel}
            {timeLabel ? ` · ${timeLabel}` : ""}
          </p>
          <p className="text-base font-semibold tabular-nums">
            {summary.totalPrice > 0
              ? `${summary.currency} ${summary.totalPrice.toLocaleString()}`
              : `${summary.currency} —`}
          </p>
        </div>
        <Button
          size="lg"
          className="h-11 min-w-[7.5rem] shrink-0"
          onClick={onConfirm}
          disabled={!isValid || isBooking}
        >
          {isBooking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  )
}
