"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Building2, Monitor } from "lucide-react"
import { CheckCircle2 } from "lucide-react"

export type ResourceType = "hot-desk" | "meeting-room" | "private-office"

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
  // Get starting prices from workspace pricing or use defaults
  const getStartingPrice = (type: ResourceType): number => {
    if (!pricing || !pricing[type]) {
      // Default fallback prices
      return type === "hot-desk" ? 500 : type === "meeting-room" ? 1500 : 5000
    }
    // Hot desk: full-day only; Private office: custom (inquiry); Meeting room: lowest capacity hourly rate
    const resourcePricing = pricing[type]
    let prices: (number | undefined)[] = []
    if (type === "hot-desk") {
      prices = [resourcePricing["full-day"]]
    } else if (type === "private-office") {
      return 0 // Custom pricing - inquiry only
    } else {
      // Meeting room: capacity tiers 1-4, 1-10, 1-35 (per hour)
      prices = [
        resourcePricing["1-4"],
        resourcePricing["1-10"],
        resourcePricing["1-35"]
      ]
    }
    const validPrices = prices.filter(p => typeof p === "number" && p > 0)
    
    return validPrices.length > 0 ? Math.min(...validPrices) : 500
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
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {resources.map((resource) => {
        const isSelected = selectedResource === resource.type
        return (
          <Card
            key={resource.type}
            className={`cursor-pointer transition-all border-2 ${
              isSelected
                ? "border-primary bg-primary/5 "
                : "border-border hover:border-border hover:bg-muted/30"
            }`}
            onClick={() => onResourceSelect(resource.type)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {resource.icon}
                </div>
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </div>
              <h3 className="font-semibold mb-1">{resource.label}</h3>
              <p className="text-xs text-muted-foreground mb-2">
                {resource.description}
              </p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">{resource.capacity}</span>
                <span className="text-sm font-semibold text-primary">
                  {resource.type === "private-office"
                    ? "Custom pricing – contact us"
                    : resource.type === "meeting-room"
                    ? resource.startingPrice > 0
                      ? `From ${resource.startingPrice.toLocaleString()} ${currency}/hr`
                      : "Capacity-based pricing"
                    : `From ${resource.startingPrice.toLocaleString()} ${currency}`}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

