"use client"

import { MapPin } from "lucide-react"
import type { Workspace } from "@/lib/hooks/use-workspace"

interface BookingHeaderProps {
  workspace: Workspace
}

export function BookingHeader({ workspace }: BookingHeaderProps) {
  return (
    <div className="min-w-0 flex-1 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{workspace.location}</span>
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
