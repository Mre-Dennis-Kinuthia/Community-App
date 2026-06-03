// TODO: Replace with API call to fetch pricing data
import useSWR from "swr"

export interface PricingOption {
  type: "hourly" | "half-day" | "full-day" | "weekly" | "monthly"
  label: string
  price: number
  savings?: number
  savingsPercent?: number
}

export interface AddOn {
  id: string
  name: string
  description: string
  price: number
  icon: string
  /** per_pax: line total = price × headcount (see booking UI). */
  pricingModel?: "fixed" | "per_pax"
}

export interface PricingData {
  basePrice: number
  options: PricingOption[]
  addOns: AddOn[]
  currency: string
}

/** Used when admin `workspace.pricing` has no `addOns` list (or empty). */
const DEFAULT_ADD_ONS: AddOn[] = [
  {
    id: "beverages",
    name: "Tea, coffee, milk & water",
    description: "Complimentary beverages with your booking.",
    price: 0,
    icon: "coffee",
  },
  {
    id: "whiteboard",
    name: "Whiteboard",
    description: "Complimentary — large whiteboard for brainstorming.",
    price: 0,
    icon: "whiteboard",
  },
  {
    id: "parking",
    name: "Parking",
    description: "Complimentary subject to availability.",
    price: 0,
    icon: "parking",
  },
  {
    id: "pastries",
    name: "Pastries",
    description:
      "KES 400 per person (PAX). Tell us how many people to cater for; you can request a customized menu when you confirm payment or in your booking notes.",
    price: 400,
    icon: "pastries",
    pricingModel: "per_pax",
  },
]

const REMOVED_ADD_ON_IDS = new Set(["projector"])

function readPositiveNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return undefined
  return value
}

/**
 * Admin `workspace.pricing` JSON is flexible. Hot-desk booking expects a numeric `full-day` tier;
 * if pricing exists but omits that shape, we still need a usable full-day price or the booking flow
 * can never reach `isValidBooking` (total stays 0).
 */
function ensureHotDeskFullDayOption(args: {
  options: PricingOption[]
  rawPricing: Record<string, unknown> | null | undefined
  startingPrice?: unknown
}): PricingOption[] {
  if (args.options.some((o) => o.type === "full-day")) return args.options

  const raw = args.rawPricing
  const hd = raw?.["hot-desk"]

  let price: number | undefined

  if (typeof hd === "number") {
    price = readPositiveNumber(hd)
  } else if (hd && typeof hd === "object") {
    const c = hd as Record<string, unknown>
    const keys = ["full-day", "fullDay", "full_day", "daily", "day", "dayRate", "price"]
    for (const k of keys) {
      const v = readPositiveNumber(c[k])
      if (v !== undefined) {
        price = v
        break
      }
    }
  }

  if (price === undefined) {
    price = readPositiveNumber(args.startingPrice)
  }
  if (price === undefined) {
    price = 2500
  }

  return [
    ...args.options.filter((o) => o.type !== "full-day"),
    { type: "full-day", label: "Full Day (8 Hours)", price },
  ]
}

type WorkspacePricingSource = {
  pricing?: unknown
  currency?: string
  startingPrice?: number
}

export function usePricing(
  workspaceId: string | undefined,
  resourceType: string,
  date?: Date,
  duration?: number,
  workspaceFromParent?: WorkspacePricingSource | null
) {
  const key =
    !workspaceFromParent && workspaceId
      ? `/api/workspace?id=${encodeURIComponent(workspaceId)}`
      : null
  const { data, error, isLoading } = useSWR<{
    workspace: { pricing?: any; currency: string; startingPrice?: number }
  }>(key)

  const source = workspaceFromParent ?? data?.workspace
  const rawPricing = source?.pricing as any | undefined
  const currency = source?.currency || "KES"
  const startingPrice = source?.startingPrice

  // Build pricing data from workspace.pricing if present, otherwise fall back to previous defaults.
  let pricing: PricingData | null = null

  if (rawPricing && typeof rawPricing === "object") {
    const options: PricingOption[] = []
    const resourceConfig = rawPricing[resourceType] || {}
    ;(["hourly", "half-day", "full-day", "weekly", "monthly"] as PricingOption["type"][]).forEach((type) => {
      const price = typeof resourceConfig[type] === "number" ? resourceConfig[type] : undefined
      if (price !== undefined) {
        options.push({
          type,
          label:
            type === "hourly"
              ? "Hourly Rate"
              : type === "half-day"
              ? "Half Day (4 Hours)"
              : type === "full-day"
              ? "Full Day (8 Hours)"
              : type === "weekly"
              ? "Weekly"
              : "Monthly",
          price,
        })
      }
    })

    let addOns: AddOn[] = Array.isArray(rawPricing.addOns)
      ? rawPricing.addOns.map((a: any) => ({
          id: String(a.id),
          name: String(a.name),
          description: String(a.description ?? ""),
          price: Number(a.price ?? 0),
          icon: String(a.icon ?? ""),
        }))
      : []

    const validAddOns = addOns
      .filter((a) => a.id && a.name && Number.isFinite(a.price) && a.price >= 0)
      .filter((a) => !REMOVED_ADD_ON_IDS.has(a.id))
    if (validAddOns.length === 0) {
      addOns = [...DEFAULT_ADD_ONS]
    } else {
      addOns = validAddOns
    }

    pricing = {
      basePrice: 0,
      currency,
      options,
      addOns,
    }

    if (resourceType === "hot-desk") {
      pricing = {
        ...pricing,
        options: ensureHotDeskFullDayOption({
          options: pricing.options,
          rawPricing: rawPricing as Record<string, unknown> | undefined,
          startingPrice,
        }),
      }
    }
  } else {
    // Fallback to existing hard-coded defaults if admin pricing is not configured yet
    // Hot desk: full-day only; Meeting room: capacity-based (handled in MeetingRoomSelector)
    const options: PricingOption[] = []
    if (resourceType === "hot-desk") {
      options.push({
        type: "full-day",
        label: "Full Day (8 Hours)",
        price: 2500,
      })
    } else if (resourceType === "meeting-room") {
      // Meeting room uses capacity tiers - fallback options for PricingBreakdown estimate
      options.push(
        { type: "hourly", label: "1-4 pax", price: 5000 },
        { type: "half-day", label: "1-10 pax", price: 8000 },
        { type: "full-day", label: "1-35 pax", price: 12000 }
      )
    }
    pricing = {
      basePrice: 0,
      currency: "KES",
      options,
      addOns: [...DEFAULT_ADD_ONS],
    }
  }

  const calculateTotal = (selectedOptions: string[], selectedAddOns: string[]) => {
    if (!pricing) return 0
    let total = pricing.basePrice
    // Add selected options
    selectedOptions.forEach(opt => {
      const option = pricing.options.find(o => o.type === opt)
      if (option) total += option.price
    })
    // Add selected add-ons
    selectedAddOns.forEach(addOnId => {
      const addOn = pricing.addOns.find(a => a.id === addOnId)
      if (addOn) total += addOn.price
    })
    return total
  }

  return {
    pricing,
    calculateTotal,
    isLoading,
    error,
  }
}

