"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Building2, Monitor, CheckCircle2 } from "lucide-react"
import { FilterChip } from "@/components/mobile/filter-chip"
import { cn } from "@/lib/utils"

export type ResourceType = "hot-desk" | "meeting-room" | "private-office" | "event-space"

interface Resource {
  type: ResourceType
  label: string
  description: string
  icon: React.ReactNode
  capacity: string
  startingPrice: number
}

interface ResourceSelectorProps {
  selectedResource: ResourceType | null
  onResourceSelect: (resource: ResourceType) => void
  pricing?: any // Pricing data from workspace
  currency?: string
}

export function ResourceSelector({ selectedResource, onResourceSelect, pricing, currency = "KES" }: ResourceSelectorProps) {
  const getStartingPrice = (type: ResourceType): number => {
    if (type === "event-space") return 0
    if (!pricing || !pricing[type]) {
      return type === "hot-desk" ? 500 : type === "meeting-room" ? 1500 : 5000
    }
    const resourcePricing = pricing[type]
    let prices: (number | undefined)[] = []
    if (type === "hot-desk") {
      prices = [resourcePricing["full-day"]]
    } else if (type === "private-office") {
      return 0
    } else {
      prices = [resourcePricing["1-4"], resourcePricing["1-10"], resourcePricing["1-35"]]
    }
    const validPrices = prices.filter((p) => typeof p === "number" && p > 0)
    return validPrices.length > 0 ? Math.min(...validPrices) : 500
  }

  const formatPrice = (resource: Resource) => {
    if (resource.type === "private-office" || resource.type === "event-space") {
      return "Custom pricing – contact us"
    }
    if (resource.type === "meeting-room") {
      return resource.startingPrice > 0
        ? `From ${resource.startingPrice.toLocaleString()} ${currency}/hr`
        : "Capacity-based pricing"
    }
    return `From ${resource.startingPrice.toLocaleString()} ${currency}`
  }

  const resources: Resource[] = [
    {
      type: "hot-desk",
      label: "Hot Desk",
      description: "Flexible workspace for individuals",
      icon: <Monitor className="h-5 w-5" />,
      capacity: "1 person",
      startingPrice: getStartingPrice("hot-desk"),
    },
    {
      type: "meeting-room",
      label: "Meeting Room",
      description: "Capacity-based hourly rates",
      icon: <Building2 className="h-5 w-5" />,
      capacity: "1–4, 1–10, 1–35 pax",
      startingPrice: getStartingPrice("meeting-room"),
    },
    {
      type: "private-office",
      label: "Private Office",
      description: "Custom pricing – inquiry",
      icon: <Users className="h-5 w-5" />,
      capacity: "Dedicated space",
      startingPrice: 0,
    },
    {
      type: "event-space",
      label: "Event Space",
      description: "Up to 70 guests – request information",
      icon: <Users className="h-5 w-5" />,
      capacity: "Up to 70 PAX",
      startingPrice: 0,
    },
  ]

  const selected = resources.find((r) => r.type === selectedResource)

  return (
    <div className="space-y-3">
      {/* Mobile: horizontal chip row */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {resources.map((resource) => (
          <FilterChip
            key={resource.type}
            label={resource.label}
            active={selectedResource === resource.type}
            onClick={() => onResourceSelect(resource.type)}
          />
        ))}
      </div>

      {selected && (
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 md:hidden">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">{selected.icon}</div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{selected.label}</p>
              <p className="text-xs text-muted-foreground">{selected.description}</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">{selected.capacity}</span>
                <span className="font-semibold text-primary">{formatPrice(selected)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: card grid */}
      <div className="hidden gap-3 md:grid md:grid-cols-2">
        {resources.map((resource) => {
          const isSelected = selectedResource === resource.type
          return (
            <Card
              key={resource.type}
              className={cn(
                "cursor-pointer border-2 transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border hover:bg-muted/30"
              )}
              onClick={() => onResourceSelect(resource.type)}
            >
              <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={cn(
                      "rounded-lg p-2",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    {resource.icon}
                  </div>
                  {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
                <h3 className="mb-1 font-semibold">{resource.label}</h3>
                <p className="mb-2 text-xs text-muted-foreground">{resource.description}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">{resource.capacity}</span>
                  <span className="text-sm font-semibold text-primary">{formatPrice(resource)}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
