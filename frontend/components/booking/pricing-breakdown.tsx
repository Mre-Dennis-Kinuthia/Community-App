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
  meetingRoomCapacity?: "1-4" | "1-10" | "1-35"
  meetingRoomHours?: number
  meetingRoomHourlyPrice?: number
  currency?: string
  /** Headcount for per-PAX add-ons (e.g. pastries). */
  pastriesPax?: number
  /** Tighter layout for sidebar. */
  compact?: boolean
  membershipDiscount?: number
}

export function PricingBreakdown({
  pricing,
  selectedDuration,
  selectedAddOns,
  resourceType,
  meetingRoomCapacity,
  meetingRoomHours = 1,
  meetingRoomHourlyPrice,
  currency: propCurrency,
  pastriesPax = 1,
  compact = false,
  membershipDiscount = 0,
}: PricingBreakdownProps) {
  const isMeetingRoom = resourceType === "meeting-room"
  const currency = propCurrency || pricing.currency

  const selectedOption = !isMeetingRoom ? pricing.options.find(opt => opt.type === selectedDuration) : null
  const selectedAddOnItems = pricing.addOns.filter(addOn => selectedAddOns.includes(addOn.id))

  const subtotal = isMeetingRoom && meetingRoomCapacity && meetingRoomHourlyPrice
    ? meetingRoomHourlyPrice * meetingRoomHours
    : (selectedOption?.price || 0)
  const addOnsTotal = selectedAddOnItems.reduce((sum, addOn) => {
    if (addOn.id === "pastries" && addOn.price > 0) {
      const n = Math.max(1, Math.floor(Number(pastriesPax) || 1))
      return sum + addOn.price * n
    }
    return sum + addOn.price
  }, 0)
  const listTotal = subtotal + addOnsTotal
  const total = Math.max(0, listTotal - membershipDiscount)

  const showMeetingRoomBreakdown = isMeetingRoom && meetingRoomCapacity && meetingRoomHourlyPrice && meetingRoomHours > 0
  const showEstimate = !showMeetingRoomBreakdown && !selectedOption && pricing.options.length > 0
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
    <Card className={compact ? "border-border/80 shadow-none" : undefined}>
      <CardHeader className={compact ? "px-4 pb-2 pt-4" : undefined}>
        <CardTitle className={compact ? "text-base" : undefined}>Your total</CardTitle>
        {!compact ? (
          <CardDescription>Transparent pricing with no hidden fees</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className={compact ? "space-y-3 px-4 pb-4 pt-0" : "space-y-4"}>
        {/* Base Price */}
        {showMeetingRoomBreakdown && (
          <div className="flex flex-col gap-2 py-2 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Meeting Room ({meetingRoomCapacity} pax)</p>
                <p className="text-xs text-muted-foreground">
                  {currency} {meetingRoomHourlyPrice.toLocaleString()}/hr × {meetingRoomHours} {meetingRoomHours === 1 ? "hr" : "hrs"}
                </p>
              </div>
              <p className="text-sm font-semibold">
                {currency} {subtotal.toLocaleString()}
              </p>
            </div>
          </div>
        )}
        {selectedOption && !isMeetingRoom && (
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-sm font-medium">{selectedOption.label}</p>
              <p className="text-xs text-muted-foreground">{resourceType}</p>
            </div>
            <p className="text-sm font-semibold">
              {currency} {selectedOption.price.toLocaleString()}
            </p>
          </div>
        )}

        {/* Estimate when no selection */}
        {showEstimate && estimateOption && (
          <div className="flex items-center justify-between py-2 border-b border-border">
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
            {selectedAddOnItems.map((addOn) => {
              const isPastriesPerPax = addOn.id === "pastries" && addOn.price > 0
              const pax = Math.max(1, Math.floor(Number(pastriesPax) || 1))
              const lineTotal = isPastriesPerPax ? addOn.price * pax : addOn.price
              return (
                <div key={addOn.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {addOn.name}
                    {isPastriesPerPax ? ` × ${pax} PAX` : addOn.price === 0 ? " (free)" : ""}
                  </span>
                  <span className="font-medium">
                    {lineTotal === 0 ? "Free" : `${pricing.currency} ${lineTotal.toLocaleString()}`}
                  </span>
                </div>
              )
            })}
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

        {membershipDiscount > 0 ? (
          <div className="flex items-center justify-between text-sm text-primary">
            <span className="font-medium">Membership benefit</span>
            <span className="font-semibold tabular-nums">
              −{currency} {membershipDiscount.toLocaleString()}
            </span>
          </div>
        ) : null}

        {/* Total */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-base font-semibold">
            {showEstimate ? "Estimate" : "Total"}
          </p>
          <p className={`text-2xl font-bold ${showEstimate && membershipDiscount <= 0 ? "text-muted-foreground" : "text-primary"}`}>
            {total <= 0 && membershipDiscount > 0
              ? "Free"
              : `${currency} ${(showEstimate && estimateOption && membershipDiscount <= 0) ? estimateOption.price.toLocaleString() : total.toLocaleString()}`}
          </p>
        </div>

        {!compact ? (
          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              All prices include taxes. No hidden fees.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

