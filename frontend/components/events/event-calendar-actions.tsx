"use client"

import { Button } from "@/components/ui/button"
import { CalendarPlus, Download } from "lucide-react"
import type { EventCalendarLinks } from "@/lib/event-calendar"

interface EventCalendarActionsProps {
  links: EventCalendarLinks
  compact?: boolean
  onGoogleClick?: () => void
}

export function EventCalendarActions({
  links,
  compact = false,
  onGoogleClick,
}: EventCalendarActionsProps) {
  const handleGoogle = () => {
    onGoogleClick?.()
    window.open(links.google, "_blank", "noopener,noreferrer")
  }

  if (compact) {
    return (
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleGoogle}>
        <CalendarPlus className="mr-2 h-4 w-4" />
        Add to Google Calendar
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="outline" className="w-full justify-start" onClick={handleGoogle}>
        <CalendarPlus className="mr-2 h-4 w-4" />
        Add to Google Calendar
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start"
        onClick={() => window.open(links.outlook, "_blank", "noopener,noreferrer")}
      >
        <CalendarPlus className="mr-2 h-4 w-4" />
        Add to Outlook
      </Button>
      <Button type="button" variant="ghost" className="w-full justify-start" asChild>
        <a href={links.icsPath} download>
          <Download className="mr-2 h-4 w-4" />
          Download calendar file (.ics)
        </a>
      </Button>
    </div>
  )
}

export function openGoogleCalendarLink(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}
