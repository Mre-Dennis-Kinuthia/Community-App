"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
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
}

/** Fixed-height mobile checkout bar — always visible during booking to prevent layout jump. */
export function StickyBookingSummary({
  summary,
  onConfirm,
  isBooking,
  isValid,
}: StickyBookingSummaryProps) {
  const dateLabel =
    summary.date != null ? format(summary.date, "MMM d") : "Select date & time"
  const timeLabel =
    summary.time ||
    (summary.resourceType === "hot-desk" ? "Full day" : summary.resourceType ? "—" : "")

  return (
    <div
      className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-border bg-background lg:hidden"
      role="region"
      aria-label="Booking total"
    >
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-3 px-4">
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
