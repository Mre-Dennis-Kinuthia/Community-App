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
  const pricing: PricingData | null = useMemo(() => null, [workspaceId, resourceType, date, duration])

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

