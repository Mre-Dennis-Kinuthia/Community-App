// TODO: Replace with API call to fetch pricing data
import { useMemo } from "react"

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
  // TODO: Replace with API call
  const pricing: PricingData | null = useMemo(() => {
    // Default pricing for Ikigai Space
    const basePricing: PricingData = {
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
    return basePricing
  }, [workspaceId, resourceType, date, duration])

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
    isLoading: false,
  }
}

