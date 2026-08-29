"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Building2, Monitor, CheckCircle2, Sparkles } from "lucide-react"
import { FilterChip } from "@/components/mobile/filter-chip"
import { cn } from "@/lib/utils"
import {
  COMMUNITY_MONTHLY_PRICE,
  DAY_PASS_PRICE,
  FIVE_DAY_PACK_PRICE,
  MEETING_ROOM_HOURLY_PRICE,
  OFFICE_FOR_A_DAY_PRICE,
  TEN_DAY_PACK_PRICE,
  formatKes,
} from "@/lib/workspace-pricing"
import Link from "next/link"

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
  hiddenResourceTypes?: ResourceType[]
  showStarConnectUpgrade?: boolean
}

export function ResourceSelector({
  selectedResource,
  onResourceSelect,
  pricing,
  currency = "KES",
  hiddenResourceTypes = [],
  showStarConnectUpgrade = false,
}: ResourceSelectorProps) {
  const hidden = new Set(hiddenResourceTypes)
  const getStartingPrice = (type: ResourceType): number => {
    if (type === "event-space") return 0
    if (type === "meeting-room") return MEETING_ROOM_HOURLY_PRICE
    if (!pricing || !pricing[type]) {
      return type === "hot-desk" ? DAY_PASS_PRICE : OFFICE_FOR_A_DAY_PRICE
    }
    const resourcePricing = pricing[type]
    let prices: (number | undefined)[] = []
    if (type === "hot-desk") {
      prices = [resourcePricing["full-day"]]
    } else if (type === "private-office") {
      return OFFICE_FOR_A_DAY_PRICE
    } else {
      prices = [resourcePricing["hourly"], resourcePricing["full-day"]]
    }
    const validPrices = prices.filter((p) => typeof p === "number" && p > 0)
    return validPrices.length > 0 ? Math.min(...validPrices) : DAY_PASS_PRICE
  }

  const formatPrice = (resource: Resource) => {
    if (resource.type === "event-space") {
      return "Custom pricing – contact us"
    }
    if (resource.type === "private-office") {
      return resource.startingPrice > 0
        ? `From ${resource.startingPrice.toLocaleString()} ${currency}/day + VAT`
        : "Office for a Day – inquiry"
    }
    if (resource.type === "meeting-room") {
      return resource.startingPrice > 0
        ? `From ${resource.startingPrice.toLocaleString()} ${currency}/hour + VAT`
        : "Hourly and day rates"
    }
    return `From ${resource.startingPrice.toLocaleString()} ${currency} + VAT`
  }

  const resources: Resource[] = [
    {
      type: "hot-desk",
      label: "Day Pass",
      description: "Flexible coworking for one weekday, 8:00 a.m. to 6:00 p.m.",
      icon: <Monitor className="h-5 w-5" />,
      capacity: "1 person",
      startingPrice: getStartingPrice("hot-desk"),
    },
    {
      type: "meeting-room",
      label: "Meeting Room",
      description: "Hourly, half-day, full-day and conference packages",
      icon: <Building2 className="h-5 w-5" />,
      capacity: "4–6 people · up to 30 pax for rooms",
      startingPrice: getStartingPrice("meeting-room"),
    },
    {
      type: "private-office",
      label: "Office for a Day",
      description: "Private furnished room · extra people at member rate",
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

  const visibleResources = resources.filter((r) => !hidden.has(r.type))
  const selected = visibleResources.find((r) => r.type === selectedResource)

  return (
    <div className="space-y-3">
      {/* Mobile: horizontal chip row */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {visibleResources.map((resource) => (
          <FilterChip
            key={resource.type}
            label={resource.label}
            active={selectedResource === resource.type}
            onClick={() => onResourceSelect(resource.type)}
          />
        ))}
        {showStarConnectUpgrade ? (
          <Link
            href="/membership/star-connect"
            className="inline-flex min-h-[36px] shrink-0 items-center rounded-full bg-muted/50 px-3.5 py-2 text-sm font-medium text-foreground/80 hover:bg-muted"
          >
            Star Connect
          </Link>
        ) : null}
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
        {visibleResources.map((resource) => {
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
        {showStarConnectUpgrade ? (
          <Link href="/membership/star-connect" className="block">
            <Card className="h-full border-2 border-dashed border-[#812926]/30 transition-colors hover:border-[#812926]/60 hover:bg-[#812926]/5">
              <CardContent className="p-4">
                <div className="mb-3 rounded-lg bg-[#812926]/10 p-2 text-[#812926] w-fit">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-semibold">Upgrade to Star Connect</h3>
                <p className="mb-2 text-xs text-muted-foreground">
                  3 days per week coworking, two complimentary meeting-room hours, and member rates.
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">Community Monthly</span>
                  <span className="text-sm font-semibold text-primary">
                    From {formatKes(COMMUNITY_MONTHLY_PRICE)} / month + VAT
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : null}
      </div>

      {showStarConnectUpgrade ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Also available: Five-Day Pack {formatKes(FIVE_DAY_PACK_PRICE)} · Ten-Day Pack{" "}
          {formatKes(TEN_DAY_PACK_PRICE)} · ask the hub team or{" "}
          <Link href="/membership/star-connect" className="font-medium text-foreground underline-offset-2 hover:underline">
            apply for Star Connect
          </Link>
          .
        </p>
      ) : null}
    </div>
  )
}
