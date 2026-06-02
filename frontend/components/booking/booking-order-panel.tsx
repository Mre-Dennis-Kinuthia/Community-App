"use client"

import { format } from "date-fns"
import { Calendar, Clock, MapPin, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ResourceType } from "./resource-selector"

const RESOURCE_LABELS: Record<string, string> = {
  "hot-desk": "Hot desk",
  "meeting-room": "Meeting room",
  "private-office": "Private office",
  "event-space": "Event space",
}

interface BookingOrderPanelProps {
  workspaceName: string
  workspaceLocation?: string
  resourceType: ResourceType | null
  date: Date | null
  time: string | null
  meetingRoomCapacity?: string
  meetingRoomHours?: number
  totalPrice: number
  currency: string
  isValid: boolean
  onCheckout: () => void
  isLoading?: boolean
  className?: string
}

export function BookingOrderPanel({
  workspaceName,
  workspaceLocation,
  resourceType,
  date,
  time,
  meetingRoomCapacity,
  meetingRoomHours,
  totalPrice,
  currency,
  isValid,
  onCheckout,
  isLoading,
  className,
}: BookingOrderPanelProps) {
  return (
    <Card className={cn("border-border/80 shadow-sm", className)}>
      <CardHeader className="space-y-1 p-4 pb-2 md:p-5">
        <CardTitle className="text-base">Your booking</CardTitle>
        <p className="text-xs text-muted-foreground line-clamp-1">{workspaceName}</p>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 md:p-5 md:pt-0">
        <ul className="space-y-2.5 text-sm">
          {resourceType ? (
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{RESOURCE_LABELS[resourceType] ?? resourceType}</span>
            </li>
          ) : (
            <li className="text-muted-foreground text-xs">Select a space to continue</li>
          )}
          {date ? (
            <li className="flex gap-2.5">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{format(date, "EEE, MMM d, yyyy")}</span>
            </li>
          ) : null}
          {(time || resourceType === "hot-desk") && date ? (
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                {resourceType === "hot-desk"
                  ? "Full day · from 09:00"
                  : time
                    ? `${time}${meetingRoomHours ? ` · ${meetingRoomHours}h` : ""}`
                    : "Pick a time"}
              </span>
            </li>
          ) : null}
          {meetingRoomCapacity ? (
            <li className="flex gap-2.5 text-muted-foreground">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {meetingRoomCapacity} people
                {meetingRoomHours ? ` · ${meetingRoomHours}h` : ""}
              </span>
            </li>
          ) : null}
        </ul>

        {workspaceLocation ? (
          <p className="text-[11px] text-muted-foreground border-t border-border pt-3">{workspaceLocation}</p>
        ) : null}

        <div className="border-t border-border pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium">{isValid ? "Total" : "Estimated"}</span>
            <span className={cn("text-xl font-bold tabular-nums", isValid ? "text-primary" : "text-muted-foreground")}>
              {currency} {totalPrice > 0 ? totalPrice.toLocaleString() : "—"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Taxes included · no hidden fees</p>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!isValid || isLoading}
          onClick={onCheckout}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading…
            </>
          ) : isValid ? (
            "Continue to checkout"
          ) : (
            "Complete steps above"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
