"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Loader2, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PillTabs } from "@/components/mobile/pill-tabs"
import { MobilePageHeader } from "@/components/mobile/mobile-page-shell"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"

type Delivery = {
  id: string
  carrier: string | null
  trackingNumber: string | null
  description: string
  status: "received" | "notified" | "picked_up"
  receivedAt: string
  pickedUpAt: string | null
  location: { id: string; name: string } | null
}

const statusLabel: Record<Delivery["status"], string> = {
  received: "At mailroom",
  notified: "Ready for pickup",
  picked_up: "Picked up",
}

function statusVariant(status: Delivery["status"]) {
  switch (status) {
    case "notified":
      return "default"
    case "received":
      return "secondary"
    default:
      return "outline"
  }
}

export default function DashboardDeliveriesPage() {
  const enabled = isFeatureEnabled("deliveryManagement")
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"active" | "history">("active")

  const loadDeliveries = useCallback(async () => {
    const res = await fetch("/api/deliveries", { credentials: "include" })
    if (res.status === 404) return []
    if (!res.ok) throw new Error("Failed to load deliveries")
    const data = await res.json()
    return (data.deliveries || []) as Delivery[]
  }, [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const rows = await loadDeliveries()
        if (!cancelled) setDeliveries(rows)
      } catch {
        if (!cancelled) toast.error("Could not load packages", "Please try again.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enabled, loadDeliveries])

  if (!enabled) {
    return (
      <div className="space-y-4">
        <MobilePageHeader title="Deliveries" description="Packages waiting at reception" />
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Delivery tracking is not enabled on this environment.
          </CardContent>
        </Card>
      </div>
    )
  }

  const active = deliveries.filter((d) => d.status !== "picked_up")
  const history = deliveries.filter((d) => d.status === "picked_up")
  const displayed = activeTab === "active" ? active : history
  const awaitingPickup = active.filter((d) => d.status === "notified").length

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex min-w-0 items-start gap-2">
        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <MobilePageHeader
          title="My packages"
          description="Deliveries logged by reception for you"
        />
      </div>

      {awaitingPickup > 0 ? (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <Package className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm">
              <span className="font-medium">{awaitingPickup}</span>{" "}
              {awaitingPickup === 1 ? "package is" : "packages are"} ready for pickup at reception.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <PillTabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "active" | "history")}
        items={[
          { value: "active", label: `Active (${active.length})` },
          { value: "history", label: `History (${history.length})` },
        ]}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : displayed.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Package className="h-10 w-10 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              {activeTab === "active"
                ? "No packages at the mailroom right now."
                : "No picked-up packages in your history."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayed.map((delivery) => (
            <Card
              key={delivery.id}
              className={cn(delivery.status === "notified" && "border-primary/40")}
            >
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{delivery.description}</p>
                    <Badge variant={statusVariant(delivery.status)}>
                      {statusLabel[delivery.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Received {format(new Date(delivery.receivedAt), "EEE, MMM d · h:mm a")}
                    {delivery.location?.name ? ` · ${delivery.location.name}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[delivery.carrier, delivery.trackingNumber].filter(Boolean).join(" · ")}
                  </p>
                  {delivery.pickedUpAt ? (
                    <p className="text-xs text-muted-foreground">
                      Picked up {format(new Date(delivery.pickedUpAt), "EEE, MMM d · h:mm a")}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
