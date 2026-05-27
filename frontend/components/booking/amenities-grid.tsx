"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wifi, Zap, Volume2, Coffee, Users, Circle } from "lucide-react"

interface Amenity {
  icon: string
  label: string
  value: string
}

interface AmenitiesGridProps {
  amenities: Amenity[]
  whoIsThisFor: string
}

const iconMap: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-5 w-5" />,
  power: <Zap className="h-5 w-5" />,
  noise: <Volume2 className="h-5 w-5" />,
  coffee: <Coffee className="h-5 w-5" />,
  community: <Users className="h-5 w-5" />,
  accessibility: <Circle className="h-5 w-5" />,
}

export function AmenitiesGrid({ amenities, whoIsThisFor }: AmenitiesGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Space Overview</CardTitle>
        <CardDescription>Everything you need to know</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amenities Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {amenities.map((amenity, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-muted/30"
            >
              <div className="text-primary">
                {iconMap[amenity.icon] || <Zap className="h-5 w-5" />}
              </div>
              <div className="text-center">
                <p className="text-xs font-medium">{amenity.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{amenity.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Who This Is For */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-semibold mb-2">Who this space is for</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {whoIsThisFor}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

