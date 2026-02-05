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
}

export interface PricingData {
  basePrice: number
  options: PricingOption[]
  addOns: AddOn[]
  currency: string
}

export function usePricing(workspaceId: string, resourceType: string, date?: Date, duration?: number) {
  const key = workspaceId ? `/api/workspace?id=${encodeURIComponent(workspaceId)}` : null
  const { data, error, isLoading } = useSWR<{ workspace: { pricing?: any; currency: string } }>(key)

  const rawPricing = data?.workspace?.pricing as any | undefined
  const currency = data?.workspace?.currency || "KES"

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

    const addOns: AddOn[] = Array.isArray(rawPricing.addOns)
      ? rawPricing.addOns.map((a: any) => ({
          id: String(a.id),
          name: String(a.name),
          description: String(a.description ?? ""),
          price: Number(a.price ?? 0),
          icon: String(a.icon ?? ""),
        }))
      : []

    pricing = {
      basePrice: 0,
      currency,
      options,
      addOns,
    }
  } else {
    // Fallback to existing hard-coded defaults if admin pricing is not configured yet
    pricing = {
      basePrice: 0,
      currency: "KES",
      options: [
        {
          type: "hourly",
          label: "Hourly Rate",
          price: resourceType === "hot-desk" ? 500 : resourceType === "meeting-room" ? 2000 : 5000,
        },
        {
          type: "half-day",
          label: "Half Day (4 Hours)",
          price: resourceType === "hot-desk" ? 1500 : resourceType === "meeting-room" ? 6000 : 15000,
        },
        {
          type: "full-day",
          label: "Full Day (8 Hours)",
          price: resourceType === "hot-desk" ? 2500 : resourceType === "meeting-room" ? 10000 : 25000,
        },
      ],
      addOns: [
        {
          id: "projector",
          name: "Projector",
          description: "HD Projector for presentations",
          price: 2000,
          icon: "projector",
        },
        {
          id: "whiteboard",
          name: "Whiteboard",
          description: "Large whiteboard for brainstorming",
          price: 500,
          icon: "whiteboard",
        },
        {
          id: "catering",
          name: "Catering",
          description: "Coffee, tea, and light snacks",
          price: 3000,
          icon: "catering",
        },
        {
          id: "parking",
          name: "Parking",
          description: "Secure parking space",
          price: 1000,
          icon: "parking",
        },
      ],
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

