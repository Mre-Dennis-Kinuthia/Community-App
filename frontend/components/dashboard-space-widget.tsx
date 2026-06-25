"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Loader2 } from "lucide-react"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { toast } from "@/lib/toast"
import { LocationSelect } from "@/components/location-select"

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => {
    if (r.status === 404) return null
    if (!r.ok) throw new Error("Failed to load")
    return r.json()
  })

export function DashboardSpaceWidget() {
  const enabled = isFeatureEnabled("spaceInventory")
  const { data, mutate, isLoading } = useSWR(enabled ? "/api/check-in" : null, fetcher)
  const [checkingIn, setCheckingIn] = useState(false)
  const [locationId, setLocationId] = useState("")
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch("/api/locations", { credentials: "include" })
      if (!res.ok) return
      const json = await res.json()
      const locs = json.locations || []
      if (!cancelled && locs.length > 1) {
        setShowLocationPicker(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!enabled) return null

  async function handleCheckIn() {
    setCheckingIn(true)
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationId ? { locationId } : {}),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error("Check-in failed", json.error || "Please try again")
        return
      }
      toast.success("Checked in", `Welcome to ${json.checkIn?.location?.name || "the hub"}!`)
      await mutate()
    } catch {
      toast.error("Check-in failed", "Please try again")
    } finally {
      setCheckingIn(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Hub today
        </CardTitle>
        <CardDescription>Your desk and daily check-in</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            {data?.assignment ? (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Your desk: {data.assignment.assetName}</p>
                  <p className="text-xs text-muted-foreground">{data.assignment.location}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No permanent desk assigned</p>
            )}
            <div className="flex flex-col gap-3">
              {data?.checkedIn ? (
                <Badge variant="default" className="w-fit">
                  Checked in{data.checkIn?.location?.name ? ` · ${data.checkIn.location.name}` : ""}
                </Badge>
              ) : (
                <>
                  {showLocationPicker ? (
                    <LocationSelect
                      value={locationId}
                      onChange={setLocationId}
                      label="Which hub?"
                    />
                  ) : null}
                  <Button size="sm" className="w-fit" onClick={() => void handleCheckIn()} disabled={checkingIn}>
                    {checkingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check in to hub"}
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
