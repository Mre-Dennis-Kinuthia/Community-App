"use client"

import Link from "next/link"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, UserRound } from "lucide-react"
import { isFeatureEnabled } from "@/lib/feature-flags"

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => {
    if (r.status === 404) return null
    if (!r.ok) throw new Error("Failed to load")
    return r.json()
  })

export function DashboardVisitorsWidget() {
  const enabled = isFeatureEnabled("visitorManagement")
  const { data, isLoading } = useSWR(enabled ? "/api/visitors" : null, fetcher)

  if (!enabled) return null

  const visitors = (data?.visitors || []) as Array<{ status: string; expectedAt: string }>
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const todayCount = visitors.filter((v) => {
    const at = new Date(v.expectedAt)
    return at >= todayStart && at <= todayEnd && v.status !== "cancelled"
  }).length

  const checkedIn = visitors.filter((v) => v.status === "checked_in").length

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <UserRound className="h-4 w-4" />
          Visitors
        </CardTitle>
        <CardDescription>Guests you have registered</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Today:</span>
              <span className="font-medium">{todayCount}</span>
              {checkedIn > 0 ? (
                <Badge variant="default">{checkedIn} on-site</Badge>
              ) : null}
            </div>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/dashboard/visitors">Manage visitors</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardDeliveriesWidget() {
  const enabled = isFeatureEnabled("deliveryManagement")
  const { data, isLoading } = useSWR(enabled ? "/api/deliveries" : null, fetcher)

  if (!enabled) return null

  const deliveries = (data?.deliveries || []) as Array<{ status: string }>
  const awaiting = deliveries.filter((d) => d.status === "notified").length
  const atMailroom = deliveries.filter((d) => d.status !== "picked_up").length

  return (
    <Card className={awaiting > 0 ? "border-primary/40" : undefined}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="h-4 w-4" />
          Packages
        </CardTitle>
        <CardDescription>Mailroom deliveries for you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm">
              {awaiting > 0 ? (
                <Badge>{awaiting} ready for pickup</Badge>
              ) : atMailroom > 0 ? (
                <span className="text-muted-foreground">{atMailroom} at mailroom</span>
              ) : (
                <span className="text-muted-foreground">No active packages</span>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/dashboard/deliveries">View packages</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
