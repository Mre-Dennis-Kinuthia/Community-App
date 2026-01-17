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
  nextAvailable: Date | null
}

export function AvailabilityCalendar({
  selectedDate,
  onDateSelect,
  unavailableDates,
  nextAvailable,
}: AvailabilityCalendarProps) {
  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date())
    const checkDate = startOfDay(date)
    
    // Disable past dates
    if (checkDate < today) return true
    
    // Disable unavailable dates
    return unavailableDates.some(d => isSameDay(d, date))
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
        <Calendar
          mode="single"
          selected={selectedDate || undefined}
          onSelect={(date) => onDateSelect(date || null)}
          disabled={isDateDisabled}
          className="rounded-lg border-0"
        />
        
        {selectedDate && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm font-medium mb-1">Selected Date</p>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, "EEEE, MMM d, yyyy")}
            </p>
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

