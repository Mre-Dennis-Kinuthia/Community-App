"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CONFERENCE_MIN_PAX,
  MEETING_ROOM_PACKAGES,
  formatKes,
  meetingRoomPackageById,
  quoteMeetingRoomPackage,
  type MeetingRoomPackageId,
} from "@/lib/workspace-pricing"

export type MeetingRoomCapacity = MeetingRoomPackageId

interface MeetingRoomSelectorProps {
  selectedCapacity: MeetingRoomCapacity | null
  selectedHours: number
  conferencePax: number
  currency: string
  rateOverrides?: Partial<Record<MeetingRoomPackageId, number>>
  onCapacitySelect: (capacity: MeetingRoomCapacity) => void
  onHoursChange: (hours: number) => void
  onConferencePaxChange: (pax: number) => void
}

export function MeetingRoomSelector({
  selectedCapacity,
  selectedHours,
  conferencePax,
  currency,
  rateOverrides,
  onCapacitySelect,
  onHoursChange,
  onConferencePaxChange,
}: MeetingRoomSelectorProps) {
  const selected = meetingRoomPackageById(selectedCapacity)
  const quote = selectedCapacity
    ? quoteMeetingRoomPackage(selectedCapacity, selectedHours, conferencePax, rateOverrides)
    : null

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {MEETING_ROOM_PACKAGES.map((pkg) => {
          const isSelected = selectedCapacity === pkg.id
          return (
            <Card
              key={pkg.id}
              className={cn(
                "cursor-pointer border-2 transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border"
              )}
              onClick={() => onCapacitySelect(pkg.id)}
            >
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{pkg.name}</p>
                  {isSelected ? (
                    <CheckCircle2 className="h-4 w-5 shrink-0 text-primary" />
                  ) : null}
                </div>
                <p className="text-sm font-semibold text-primary">
                  {formatKes(rateOverrides?.[pkg.id] ?? pkg.price)} {pkg.pricePeriod}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {pkg.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selected?.billing === "hourly" ? (
        <div>
          <p className="mb-3 text-sm font-medium">Number of hours</p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
              <Button
                key={h}
                size="sm"
                variant={selectedHours === h ? "default" : "outline"}
                onClick={() => onHoursChange(h)}
                className="h-9 min-w-[44px]"
              >
                {h} {h === 1 ? "hr" : "hrs"}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {selected?.billing === "per_person" ? (
        <div className="max-w-xs space-y-2">
          <Label htmlFor="conference-pax">Number of people (minimum {CONFERENCE_MIN_PAX})</Label>
          <Input
            id="conference-pax"
            type="number"
            min={CONFERENCE_MIN_PAX}
            max={200}
            value={conferencePax}
            onChange={(e) =>
              onConferencePaxChange(Math.max(CONFERENCE_MIN_PAX, Number(e.target.value) || CONFERENCE_MIN_PAX))
            }
          />
        </div>
      ) : null}

      {quote && selected ? (
        <p className="text-xs text-muted-foreground">
          Total: {currency} {quote.basePrice.toLocaleString()} + VAT
          {selected.billing === "hourly"
            ? ` (${(rateOverrides?.[selected.id] ?? selected.price).toLocaleString()}/hr × ${quote.hours} hrs)`
            : selected.billing === "per_person"
              ? ` (${(rateOverrides?.[selected.id] ?? selected.price).toLocaleString()}/person × ${Math.max(selected.minPax ?? CONFERENCE_MIN_PAX, conferencePax)} people)`
              : ` · ${quote.hours} hours`}
        </p>
      ) : null}
    </div>
  )
}
