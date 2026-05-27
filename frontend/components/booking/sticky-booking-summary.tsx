"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, Building2, X, Loader2 } from "lucide-react"
import { format } from "date-fns"
import type { ResourceType } from "./resource-selector"
import type { BookingDuration } from "./time-selector"

interface BookingSummary {
  date: Date | null
  time: string | null
  duration: BookingDuration
  resourceType: ResourceType | null
  addOns: string[]
  totalPrice: number
  currency: string
  meetingRoomCapacity?: "1-4" | "1-10" | "1-35"
  meetingRoomHours?: number
}

interface StickyBookingSummaryProps {
  summary: BookingSummary
  onClear: () => void
  onConfirm: () => void
  isBooking: boolean
  isValid: boolean
  showDesktop?: boolean
}

export function StickyBookingSummary({
  summary,
  onClear,
  onConfirm,
  isBooking,
  isValid,
  showDesktop = true,
}: StickyBookingSummaryProps) {
  if (!isValid) return null

  return (
    <>
      {/* Desktop: Right Side Sticky */}
      <div className={showDesktop ? "hidden lg:block" : "hidden"}>
        <div className="sticky top-24">
          <Card className="border border-border ">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Booking Summary</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClear}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {summary.date && (
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{format(summary.date, "MMM d, yyyy")}</span>
                  </div>
                )}

                {(summary.time ||
                  (summary.resourceType === "hot-desk" && summary.duration === "full-day")) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">
                      {summary.time ||
                        (summary.resourceType === "hot-desk" && summary.duration === "full-day"
                          ? "09:00 (full day)"
                          : "—")}
                    </span>
                  </div>
                )}

                {summary.resourceType && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Resource:</span>
                    <Badge variant="outline" className="text-xs">
                      {summary.resourceType === "hot-desk" && "Hot Desk"}
                      {summary.resourceType === "meeting-room" && (
                        <>Meeting Room {summary.meetingRoomCapacity && `(${summary.meetingRoomCapacity} pax, ${summary.meetingRoomHours}h)`}</>
                      )}
                      {summary.resourceType === "private-office" && "Private Office"}
                    </Badge>
                  </div>
                )}

                {summary.addOns.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Add-ons: </span>
                    <span className="font-medium">{summary.addOns.length}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {summary.currency} {summary.totalPrice.toLocaleString()}
                  </span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={onConfirm}
                  disabled={isBooking}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    "Review & confirm"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile: Bottom Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background border-t border-border shadow-sm pb-[env(safe-area-inset-bottom)]">
        <div className="container px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {summary.date && format(summary.date, "MMM d")}
                {summary.date ? " · " : ""}
                {summary.time ||
                  (summary.resourceType === "hot-desk" && summary.duration === "full-day"
                    ? "Full day · 09:00"
                    : summary.resourceType === "hot-desk"
                      ? "Full day"
                      : "—")}
              </p>
              <p className="text-base font-bold text-primary">
                {summary.currency} {summary.totalPrice.toLocaleString()}
              </p>
            </div>
            <Button
              size="lg"
              onClick={onConfirm}
              disabled={isBooking}
              className=" flex-shrink-0"
            >
              {isBooking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Review & confirm"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

