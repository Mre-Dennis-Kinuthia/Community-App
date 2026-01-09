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
    <div className="relative flex items-start gap-4">
      {/* Timeline line */}
      <div className="relative flex flex-col items-center">
        {!isLast && (
          <div
            className={`absolute top-4 w-px border-l border-dotted border-border/60 ${
              isFirst ? "top-4" : "top-0"
            } h-full`}
          />
        )}
        <div className="relative z-10 flex h-2.5 w-2.5 items-center justify-center rounded-full border-2 border-primary/20 bg-background shadow-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
      </div>

      {/* Date content */}
      <div className="flex-1 pb-5 pt-0.5">
        <div className="flex items-center gap-1.5">
          <div className="text-sm font-medium text-foreground leading-tight">{displayLabel}</div>
          {eventCount !== undefined && eventCount > 0 && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-medium">
              {eventCount}
            </Badge>
          )}
        </div>
        {!label && <div className="mt-0.5 text-xs text-muted-foreground leading-tight">{dayOfWeek}</div>}
      </div>
    </div>
  )
}

