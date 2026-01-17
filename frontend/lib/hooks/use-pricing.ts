// Mock hook for pricing data
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
  const pricing: PricingData = useMemo(() => ({
    basePrice: 1500,
    currency: "KES",
    options: [
      { type: "hourly", label: "Hourly", price: 500 },
      { type: "half-day", label: "Half Day (4 hours)", price: 1500 },
      { type: "full-day", label: "Full Day (8 hours)", price: 2500 },
      { type: "weekly", label: "Weekly Pass", price: 10000, savings: 2500, savingsPercent: 20 },
      { type: "monthly", label: "Monthly Pass", price: 35000, savings: 10000, savingsPercent: 22 },
    ],
    addOns: [
      { id: "monitor", name: "Extra Monitor", description: "27-inch 4K display", price: 500, icon: "monitor" },
      { id: "projector", name: "Projector", description: "HD projector for presentations", price: 1000, icon: "projector" },
      { id: "coffee", name: "Coffee Plan", description: "Unlimited premium coffee", price: 300, icon: "coffee" },
      { id: "meeting-hours", name: "Meeting Room Hours", description: "Additional meeting room access", price: 2000, icon: "meeting" },
    ],
  }), [workspaceId, resourceType, date, duration])

  const calculateTotal = (selectedOptions: string[], selectedAddOns: string[]) => {
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

