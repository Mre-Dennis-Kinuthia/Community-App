"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Monitor, Video, Coffee, Users, Presentation, Car } from "lucide-react"
import type { AddOn } from "@/lib/hooks/use-pricing"

interface AddOnSelectorProps {
  addOns: AddOn[]
  selectedAddOns: string[]
  onToggle: (addOnId: string) => void
}

const iconMap: Record<string, React.ReactNode> = {
  monitor: <Monitor className="h-5 w-5" />,
  projector: <Video className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  coffee: <Coffee className="h-5 w-5" />,
  catering: <Coffee className="h-5 w-5" />,
  meeting: <Users className="h-5 w-5" />,
  whiteboard: <Presentation className="h-5 w-5" />,
  parking: <Car className="h-5 w-5" />,
  pastries: <Coffee className="h-5 w-5" />,
}

export function AddOnSelector({ addOns, selectedAddOns, onToggle }: AddOnSelectorProps) {
  if (addOns.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Add-ons (Optional)</h3>
        <span className="text-xs text-muted-foreground">
          {selectedAddOns.length} selected
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {addOns.map((addOn) => {
          const isSelected = selectedAddOns.includes(addOn.id)
          return (
            <Card
              key={addOn.id}
              className={`cursor-pointer transition-all border-2 ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border"
              }`}
              onClick={() => onToggle(addOn.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggle(addOn.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-primary">
                        {iconMap[addOn.icon] || <Monitor className="h-4 w-4" />}
                      </div>
                      <h4 className="text-sm font-medium">{addOn.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {addOn.description}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {addOn.price === 0 ? "Free" : `${addOn.price.toLocaleString()} KES`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

