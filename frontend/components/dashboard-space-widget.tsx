"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Loader2 } from "lucide-react"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { toast } from "@/lib/toast"

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

  if (!enabled) return null

  async function handleCheckIn() {
    setCheckingIn(true)
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
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
            <div className="flex items-center justify-between gap-3">
              {data?.checkedIn ? (
                <Badge variant="default">Checked in today</Badge>
              ) : (
                <Button size="sm" onClick={() => void handleCheckIn()} disabled={checkingIn}>
                  {checkingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check in to hub"}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
