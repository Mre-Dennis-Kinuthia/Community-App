"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, Info } from "lucide-react"
import type { PricingData } from "@/lib/hooks/use-pricing"
import { useMemo } from "react"

interface PricingBreakdownProps {
  pricing: PricingData
  selectedDuration: "hourly" | "half-day" | "full-day" | "monthly"
  selectedAddOns: string[]
  resourceType: string
}

export function PricingBreakdown({
  pricing,
  selectedDuration,
  selectedAddOns,
  resourceType,
}: PricingBreakdownProps) {
  const selectedOption = pricing.options.find(opt => opt.type === selectedDuration)
  const selectedAddOnItems = pricing.addOns.filter(addOn => selectedAddOns.includes(addOn.id))

  const subtotal = selectedOption?.price || 0
  const addOnsTotal = selectedAddOnItems.reduce((sum, addOn) => sum + addOn.price, 0)
  const total = subtotal + addOnsTotal

  // Show estimate if no selection made
  const showEstimate = !selectedOption && pricing.options.length > 0
  const estimateOption = showEstimate ? pricing.options[0] : null

  const savings = useMemo(() => {
    // Check if weekly/monthly options have savings
    const weeklyOption = pricing.options.find(opt => opt.type === "weekly")
    const monthlyOption = pricing.options.find(opt => opt.type === "monthly")
    
    if (selectedDuration === "full-day" && weeklyOption?.savings) {
      return weeklyOption.savings
    }
    return null
  }, [selectedDuration, pricing.options])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Breakdown</CardTitle>
        <CardDescription>Transparent pricing with no hidden fees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Price */}
        {selectedOption && (
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div>
              <p className="text-sm font-medium">{selectedOption.label}</p>
              <p className="text-xs text-muted-foreground">{resourceType}</p>
            </div>
            <p className="text-sm font-semibold">
              {pricing.currency} {selectedOption.price.toLocaleString()}
            </p>
          </div>
        )}

        {/* Estimate when no selection */}
        {showEstimate && estimateOption && (
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Starting from</p>
              <p className="text-xs text-muted-foreground">{estimateOption.label}</p>
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              {pricing.currency} {estimateOption.price.toLocaleString()}
            </p>
          </div>
        )}

        {/* Add-ons */}
        {selectedAddOnItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Add-ons</p>
            {selectedAddOnItems.map((addOn) => (
              <div key={addOn.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{addOn.name}</span>
                <span className="font-medium">
                  {pricing.currency} {addOn.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Savings Nudge */}
        {savings && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <TrendingDown className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">
                Save {pricing.options.find(opt => opt.type === "weekly")?.savingsPercent}% with Weekly Pass
              </p>
              <p className="text-xs text-muted-foreground">
                {pricing.currency} {savings.toLocaleString()} savings
              </p>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <p className="text-base font-semibold">
            {showEstimate ? "Estimate" : "Total"}
          </p>
          <p className={`text-2xl font-bold ${showEstimate ? "text-muted-foreground" : "text-primary"}`}>
            {pricing.currency} {(showEstimate && estimateOption) ? estimateOption.price.toLocaleString() : total.toLocaleString()}
          </p>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            All prices include taxes. No hidden fees. Cancel anytime.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

