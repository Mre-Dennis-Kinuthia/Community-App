"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface TimelineDateProps {
  date: Date
  label?: string
  eventCount?: number
  isFirst?: boolean
  isLast?: boolean
}

export function TimelineDate({ date, label, eventCount, isFirst, isLast }: TimelineDateProps) {
  const dayOfWeek = format(date, "EEEE")
  const dateString = format(date, "MMM d, yyyy")
  const displayLabel = label || dateString

  return (
    <div className="relative flex items-start gap-6">
      {/* Timeline line */}
      <div className="relative flex flex-col items-center">
        {!isLast && (
          <div
            className={`absolute top-6 w-px border-l border-dotted border-border ${
              isFirst ? "top-6" : "top-0"
            } h-full`}
          />
        )}
        <div className="relative z-10 flex h-3 w-3 items-center justify-center rounded-full border-2 border-border bg-background">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
      </div>

      {/* Date content */}
      <div className="flex-1 pb-8 pt-1">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-foreground">{displayLabel}</div>
          {eventCount !== undefined && eventCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {eventCount}
            </Badge>
          )}
        </div>
        {!label && <div className="text-xs text-muted-foreground">{dayOfWeek}</div>}
      </div>
    </div>
  )
}

