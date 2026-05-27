"use client"

import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Workspace } from "@/lib/hooks/use-workspace"

interface BookingHeaderProps {
  workspace: Workspace
  onBookNow: () => void
  onCheckAvailability: () => void
}

export function BookingHeader({ workspace, onBookNow, onCheckAvailability }: BookingHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Location & Name */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{workspace.location}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          {workspace.name}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {workspace.valueProposition}
        </p>
      </div>

      {/* Company Logos */}
      {workspace.companyLogos && workspace.companyLogos.length > 0 && (
        <div className="flex items-center gap-4 pt-2">
          <span className="text-xs text-muted-foreground">Trusted by:</span>
          <div className="flex items-center gap-3">
            {workspace.companyLogos.map((company, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {company}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Primary CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button 
          size="lg" 
          onClick={onBookNow}
          className="flex-1 sm:flex-initial sm:min-w-[160px]"
        >
          Book Now
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          onClick={onCheckAvailability}
          className="flex-1 sm:flex-initial sm:min-w-[180px]"
        >
          Check Availability
        </Button>
      </div>
    </div>
  )
}

