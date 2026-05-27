"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, CheckCircle2 } from "lucide-react"

export type MeetingRoomCapacity = "1-4" | "1-10" | "1-35"

interface MeetingRoomOption {
  capacity: MeetingRoomCapacity
  label: string
  description: string
  pricePerHour: number
}

interface MeetingRoomSelectorProps {
  selectedCapacity: MeetingRoomCapacity | null
  selectedHours: number
  pricing: Record<string, number> | undefined
  currency: string
  onCapacitySelect: (capacity: MeetingRoomCapacity) => void
  onHoursChange: (hours: number) => void
}

const DEFAULT_PRICES: Record<MeetingRoomCapacity, number> = {
  "1-4": 5000,
  "1-10": 8000,
  "1-35": 12000,
}

export function MeetingRoomSelector({
  selectedCapacity,
  selectedHours,
  pricing,
  currency,
  onCapacitySelect,
  onHoursChange,
}: MeetingRoomSelectorProps) {
  const getPrice = (cap: MeetingRoomCapacity): number => {
    const price = pricing?.[cap]
    return typeof price === "number" && price > 0 ? price : DEFAULT_PRICES[cap]
  }

  const options: MeetingRoomOption[] = [
    { capacity: "1-4", label: "1–4 pax", description: "Small meeting", pricePerHour: getPrice("1-4") },
    { capacity: "1-10", label: "1–10 pax", description: "Medium room", pricePerHour: getPrice("1-10") },
    { capacity: "1-35", label: "1–35 pax", description: "Large room", pricePerHour: getPrice("1-35") },
  ]

  const hourlyOptions = [1, 2, 3, 4, 5, 6, 7, 8]
  const hourlyPrice = selectedCapacity ? getPrice(selectedCapacity) : 0
  const totalPrice = selectedCapacity ? hourlyPrice * selectedHours : 0

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium mb-3">Select capacity</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {options.map((opt) => {
            const isSelected = selectedCapacity === opt.capacity
            return (
              <Card
                key={opt.capacity}
                className={`cursor-pointer transition-all border-2 ${
                  isSelected
                    ? "border-primary bg-primary/5 "
                    : "border-border hover:border-border"
                }`}
                onClick={() => onCapacitySelect(opt.capacity)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Users className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                  <p className="font-semibold text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mb-2">{opt.description}</p>
                  <p className="text-sm font-semibold text-primary">
                    {currency} {opt.pricePerHour.toLocaleString()}/hr
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {selectedCapacity && (
        <div>
          <p className="text-sm font-medium mb-3">Number of hours</p>
          <div className="flex flex-wrap gap-2">
            {hourlyOptions.map((h) => {
              const isSelected = selectedHours === h
              return (
                <Button
                  key={h}
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => onHoursChange(h)}
                  className="h-9 min-w-[44px]"
                >
                  {isSelected && <CheckCircle2 className="mr-1 h-3 w-3" />}
                  {h} {h === 1 ? "hr" : "hrs"}
                </Button>
              )
            })}
          </div>
          {selectedHours > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Total: {currency} {totalPrice.toLocaleString()} ({hourlyPrice.toLocaleString()}/hr × {selectedHours} hrs)
            </p>
          )}
        </div>
      )}
    </div>
  )
}
