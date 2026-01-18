"use client"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Info } from "lucide-react"
import { format, startOfDay, isSameDay } from "date-fns"
import type { AvailabilityData } from "@/lib/hooks/use-availability"

interface AvailabilityCalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date | null) => void
  unavailableDates: Date[]
  datesWithBookings?: Date[] // For hot desks - dates with bookings (visual indicator)
  nextAvailable: Date | null
  resourceType?: "hot-desk" | "meeting-room" | "private-office"
}

export function AvailabilityCalendar({
  selectedDate,
  onDateSelect,
  unavailableDates,
  datesWithBookings = [],
  nextAvailable,
  resourceType = "hot-desk",
}: AvailabilityCalendarProps) {
  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date())
    const checkDate = startOfDay(date)
    
    // Disable past dates
    if (checkDate < today) return true
    
    // For hot desks: don't block dates with bookings, only block truly unavailable dates
    // For meeting rooms: block unavailable dates (including fully booked)
    return unavailableDates.some(d => isSameDay(d, date))
  }

  const hasBookings = (date: Date) => {
    return datesWithBookings.some(d => isSameDay(d, date))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Select Date
        </CardTitle>
        <CardDescription>Choose your booking date</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={(date) => onDateSelect(date || null)}
            disabled={isDateDisabled}
            className="rounded-lg border-0"
            modifiers={{
              hasBookings: (date) => hasBookings(date),
            }}
            modifiersClassNames={{
              hasBookings: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-yellow-500",
            }}
          />
        </div>
        
        {selectedDate && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm font-medium mb-1">Selected Date</p>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, "EEEE, MMM d, yyyy")}
            </p>
          </div>
        )}

        {resourceType === "hot-desk" && datesWithBookings.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
            <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Hot Desk Availability</p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                Dates with a yellow dot have existing bookings but are still available
              </p>
            </div>
          </div>
        )}

        {nextAvailable && !selectedDate && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">Next Available</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(nextAvailable, "EEEE, MMM d, yyyy")}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

