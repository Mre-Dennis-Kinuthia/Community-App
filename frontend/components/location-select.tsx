"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type LocationOption = {
  id: string
  name: string
  workspaceName?: string | null
}

type LocationSelectProps = {
  label?: string
  value: string
  onChange: (locationId: string) => void
  required?: boolean
  className?: string
  autoSelectSingle?: boolean
  onLoaded?: (locations: LocationOption[]) => void
}

export function LocationSelect({
  label = "Hub",
  value,
  onChange,
  required,
  className,
  autoSelectSingle = true,
  onLoaded,
}: LocationSelectProps) {
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/locations", { credentials: "include" })
        if (!res.ok) throw new Error("Failed to load hubs")
        const data = await res.json()
        const rows = (data.locations || []) as LocationOption[]
        if (cancelled) return
        setLocations(rows)
        onLoaded?.(rows)
        if (autoSelectSingle && rows.length === 1 && !value) {
          onChange(rows[0].id)
        }
      } catch {
        if (!cancelled) {
          setLocations([])
          onLoaded?.([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once
  }, [])

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {label ? <Label>{label}{required ? " *" : ""}</Label> : null}
        <p className="text-sm text-muted-foreground">Loading hubs…</p>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className={cn("space-y-1", className)}>
        {label ? <Label>{label}{required ? " *" : ""}</Label> : null}
        <p className="text-sm text-destructive">No hubs available. Contact support.</p>
      </div>
    )
  }

  if (locations.length === 1) {
    return (
      <div className={cn("space-y-1", className)}>
        {label ? <Label>{label}{required ? " *" : ""}</Label> : null}
        <p className="text-sm font-medium">{locations[0].name}</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label>{label}{required ? " *" : ""}</Label> : null}
      <Select value={value || undefined} onValueChange={onChange} required={required}>
        <SelectTrigger>
          <SelectValue placeholder="Select hub" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((loc) => (
            <SelectItem key={loc.id} value={loc.id}>
              {loc.name}
              {loc.workspaceName && loc.workspaceName !== loc.name ? ` (${loc.workspaceName})` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
