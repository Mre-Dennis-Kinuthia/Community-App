"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"

export type BookingDuration = "hourly" | "half-day" | "full-day"

interface TimeSelectorProps {
  selectedTime: string | null
  selectedDuration: BookingDuration
  onTimeSelect: (time: string) => void
  onDurationChange: (duration: BookingDuration) => void
  availableSlots: { time: string; available: boolean }[]
  date: Date | null
}

export function TimeSelector({
  selectedTime,
  selectedDuration,
  onTimeSelect,
  onDurationChange,
  availableSlots,
  date,
}: TimeSelectorProps) {
  if (!date) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Select a date to see available times</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Duration Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Duration:</span>
        <Select value={selectedDuration} onValueChange={onDurationChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="half-day">Half Day</SelectItem>
            <SelectItem value="full-day">Full Day</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time Slots */}
      <div>
        <p className="text-sm font-medium mb-3">Available Times</p>
        <div className="flex flex-wrap gap-2">
          {availableSlots.map((slot) => {
            const isSelected = selectedTime === slot.time
            const timeDate = new Date()
            const [hours, minutes] = slot.time.split(":")
            timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
            const displayTime = format(timeDate, "h:mm a")

            return (
              <Button
                key={slot.time}
                size="sm"
                variant={isSelected ? "default" : "outline"}
                onClick={() => slot.available && onTimeSelect(slot.time)}
                disabled={!slot.available}
                className="h-9 text-xs button-press"
              >
                {isSelected && <CheckCircle2 className="mr-1 h-3 w-3" />}
                {displayTime}
              </Button>
            )
          })}
        </div>
        {availableSlots.filter(s => !s.available).length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Unavailable times are disabled
          </p>
        )}
      </div>
    </div>
  )
}

