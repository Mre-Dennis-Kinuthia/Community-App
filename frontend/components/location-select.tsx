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

type LocationOption = { id: string; name: string }

type LocationSelectProps = {
  label?: string
  value: string
  onChange: (locationId: string) => void
  required?: boolean
  className?: string
  autoSelectSingle?: boolean
}

export function LocationSelect({
  label = "Hub location",
  value,
  onChange,
  required,
  className,
  autoSelectSingle = true,
}: LocationSelectProps) {
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/locations", { credentials: "include" })
        if (!res.ok) throw new Error("Failed to load locations")
        const data = await res.json()
        const rows = (data.locations || []) as LocationOption[]
        if (cancelled) return
        setLocations(rows)
        if (autoSelectSingle && rows.length === 1 && !value) {
          onChange(rows[0].id)
        }
      } catch {
        if (!cancelled) setLocations([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [autoSelectSingle, onChange, value])

  if (!loading && locations.length === 1) {
    return (
      <div className={cn("space-y-1", className)}>
        {label ? <Label>{label}{required ? " *" : ""}</Label> : null}
        <p className="text-sm font-medium">{locations[0].name}</p>
      </div>
    )
  }

  if (locations.length <= 1 && !loading) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label>{label}{required ? " *" : ""}</Label> : null}
      <Select value={value || undefined} onValueChange={onChange} disabled={loading || locations.length === 0}>
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Loading locations…" : "Select hub location"} />
        </SelectTrigger>
        <SelectContent>
          {locations.map((loc) => (
            <SelectItem key={loc.id} value={loc.id}>
              {loc.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
