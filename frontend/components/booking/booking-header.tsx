"use client"

import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Workspace } from "@/lib/hooks/use-workspace"

interface BookingHeaderProps {
  workspace: Workspace
  onBookNow: () => void
  onCheckAvailability?: () => void
}

export function BookingHeader({ workspace, onBookNow }: BookingHeaderProps) {
  return (
    <div className="min-w-0 flex-1 space-y-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{workspace.location}</span>
      </div>
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
        {workspace.name}
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3">
        {workspace.valueProposition}
      </p>
      {workspace.companyLogos && workspace.companyLogos.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {workspace.companyLogos.slice(0, 4).map((company, i) => (
            <Badge key={i} variant="outline" className="text-[10px] font-normal">
              {company}
            </Badge>
          ))}
        </div>
      ) : null}
      <Button
        type="button"
        variant="link"
        className="h-auto p-0 text-sm text-primary"
        onClick={onBookNow}
      >
        Jump to availability →
      </Button>
    </div>
  )
}

