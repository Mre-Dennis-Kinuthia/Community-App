"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"

export type BookingDuration = "hourly" | "half-day" | "full-day" | "monthly"
export type HalfDayPeriod = "morning" | "afternoon"

interface TimeSelectorProps {
  selectedTime: string | null
  selectedDuration: BookingDuration
  selectedHalfDay?: HalfDayPeriod
  onTimeSelect: (time: string) => void
  onDurationChange: (duration: BookingDuration) => void
  onHalfDaySelect?: (period: HalfDayPeriod) => void
  availableSlots: { time: string; available: boolean }[]
  date: Date | null
  resourceType?: "hot-desk" | "meeting-room" | "private-office"
}

export function TimeSelector({
  selectedTime,
  selectedDuration,
  selectedHalfDay,
  onTimeSelect,
  onDurationChange,
  onHalfDaySelect,
  availableSlots,
  date,
  resourceType = "hot-desk",
}: TimeSelectorProps) {
  if (!date) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Select a date to see available times</p>
      </div>
    )
  }

  // Hot desk: full-day only (no time selection). Private office: monthly only (no time selection).
  const isHotDesk = resourceType === "hot-desk"
  const isPrivateOffice = resourceType === "private-office"
  const showTimeSlots = !isHotDesk && !isPrivateOffice && selectedDuration !== "monthly"
  const showHalfDaySelector = isHotDesk && selectedDuration === "half-day"
  const hideTimeSelector = (isHotDesk && selectedDuration === "full-day") || (isPrivateOffice && selectedDuration === "monthly")

  // Calculate start time based on half-day selection
  const getHalfDayStartTime = (period: HalfDayPeriod) => {
    return period === "morning" ? "09:00" : "13:00"
  }

  const handleHalfDaySelect = (period: HalfDayPeriod) => {
    if (onHalfDaySelect) {
      onHalfDaySelect(period)
      // Auto-set the start time for the selected half
      onTimeSelect(getHalfDayStartTime(period))
    }
  }

  return (
    <div className="space-y-4">
      {/* Duration Selector - Hot desk: full-day only; Private office: monthly only; Meeting room: all options */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Duration:</span>
        <Select value={selectedDuration} onValueChange={onDurationChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {isHotDesk && <SelectItem value="full-day">Full Day</SelectItem>}
            {isPrivateOffice && <SelectItem value="monthly">Monthly</SelectItem>}
            {!isHotDesk && !isPrivateOffice && (
              <>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
                <SelectItem value="full-day">Full Day</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Half Day Selector (for hot desks) */}
      {showHalfDaySelector && (
        <div>
          <p className="text-sm font-medium mb-3">Select Half of Day</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedHalfDay === "morning" ? "default" : "outline"}
              onClick={() => handleHalfDaySelect("morning")}
              className="flex-1"
            >
              {selectedHalfDay === "morning" && <CheckCircle2 className="mr-1 h-3 w-3" />}
              Morning (9 AM - 1 PM)
            </Button>
            <Button
              size="sm"
              variant={selectedHalfDay === "afternoon" ? "default" : "outline"}
              onClick={() => handleHalfDaySelect("afternoon")}
              className="flex-1"
            >
              {selectedHalfDay === "afternoon" && <CheckCircle2 className="mr-1 h-3 w-3" />}
              Afternoon (1 PM - 5 PM)
            </Button>
          </div>
          {selectedHalfDay && (
            <p className="text-xs text-muted-foreground mt-2">
              Selected: {selectedHalfDay === "morning" ? "Morning" : "Afternoon"} half
            </p>
          )}
        </div>
      )}

      {/* Full Day / Monthly Message - no time selection needed */}
      {hideTimeSelector && (
        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-sm font-medium mb-1">
            {selectedDuration === "monthly" ? "Monthly Booking" : "Full Day Booking"}
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedDuration === "monthly"
              ? "You've selected a monthly private office. No specific time selection is needed."
              : "You've selected a full day booking. No specific time selection is needed."}
          </p>
        </div>
      )}

      {/* Time Slots (for hourly bookings or meeting rooms) */}
      {showTimeSlots && (
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
      )}
    </div>
  )
}

