"use client"

import { ExternalLink, MapPin } from "lucide-react"
import type { Workspace } from "@/lib/hooks/use-workspace"

interface BookingHeaderProps {
  workspace: Workspace
}

export function BookingHeader({ workspace }: BookingHeaderProps) {
  const mapsUrl = workspace.googleMapsUrl?.trim()
  const locationLine = [workspace.location, workspace.address].filter(Boolean).join(" · ")

  return (
    <div className="min-w-0 flex-1 space-y-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 truncate">{locationLine || workspace.location}</span>
        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-0.5 font-medium text-primary hover:underline"
          >
            Directions
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>
      <h1 className="text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">{workspace.name}</h1>
      {workspace.valueProposition ? (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {workspace.valueProposition}
        </p>
      ) : null}
    </div>
  )
}
