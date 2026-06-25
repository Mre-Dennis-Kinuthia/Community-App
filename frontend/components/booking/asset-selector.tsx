"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Loader2, Users } from "lucide-react"
import { isFeatureEnabled } from "@/lib/feature-flags"
import type { ResourceType } from "@/components/booking/resource-selector"

export interface SpaceAssetOption {
  id: string
  name: string
  type: string
  capacity: number
  location?: string
  zone?: string
  floor?: string
}

interface AssetSelectorProps {
  resourceType: ResourceType
  date: string | null
  startTime: string | null
  duration: string
  meetingRoomHours?: number
  selectedAssetId: string | null
  onSelect: (assetId: string | null) => void
}

export function AssetSelector({
  resourceType,
  date,
  startTime,
  duration,
  meetingRoomHours,
  selectedAssetId,
  onSelect,
}: AssetSelectorProps) {
  const [assets, setAssets] = useState<SpaceAssetOption[]>([])
  const [loading, setLoading] = useState(false)

  const enabled = isFeatureEnabled("spaceInventory")
  const canFetch =
    enabled &&
    date &&
    resourceType &&
    (resourceType === "hot-desk" || startTime)

  useEffect(() => {
    if (!canFetch) {
      setAssets([])
      onSelect(null)
      return
    }

    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          type: resourceType,
          date,
          duration,
        })
        if (startTime) params.set("startTime", startTime)
        if (meetingRoomHours) params.set("meetingRoomHours", String(meetingRoomHours))
        const res = await fetch(`/api/space/assets?${params}`)
        if (!res.ok) {
          setAssets([])
          return
        }
        const data = await res.json()
        if (!cancelled) {
          setAssets(data.assets || [])
          if ((data.assets || []).length === 1) {
            onSelect(data.assets[0].id)
          }
        }
      } catch {
        if (!cancelled) setAssets([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [canFetch, date, resourceType, startTime, duration, meetingRoomHours, onSelect])

  if (!enabled) return null
  if (!date) return null

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading available spaces…
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        No specific spaces configured — booking will use resource type only.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Select a specific space</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {assets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => onSelect(asset.id)}
            className={cn(
              "rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/50",
              selectedAssetId === asset.id && "border-primary bg-primary/5 ring-1 ring-primary"
            )}
          >
            <div className="font-medium">{asset.name}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {asset.capacity} {asset.capacity === 1 ? "person" : "people"}
            </div>
            {asset.location ? (
              <div className="mt-1 text-xs text-muted-foreground">{asset.location}</div>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}
