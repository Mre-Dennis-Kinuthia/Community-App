"use client"

import { useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  EXPERT_SESSION_DURATIONS,
  EXPERT_WEEKDAYS,
  weekdayLabel,
  type ExpertAvailabilityWindowInput,
} from "@/lib/expert-availability"
import { EXPERT_SECTOR_SUGGESTIONS, normalizeTagList } from "@/lib/experts"
import { cn } from "@/lib/utils"

type WindowRow = ExpertAvailabilityWindowInput & { key: string }

type ExpertAvailabilityEditorProps = {
  industries: string[]
  websiteUrl: string
  sessionDurationMinutes: number
  availabilityEnabled: boolean
  windows: ExpertAvailabilityWindowInput[]
  saving?: boolean
  onSave: (payload: {
    industries: string[]
    websiteUrl: string
    sessionDurationMinutes: number
    availabilityEnabled: boolean
    availabilityWindows: ExpertAvailabilityWindowInput[]
  }) => Promise<void>
}

export function ExpertAvailabilityEditor({
  industries,
  websiteUrl,
  sessionDurationMinutes,
  availabilityEnabled,
  windows,
  saving = false,
  onSave,
}: ExpertAvailabilityEditorProps) {
  const [sectors, setSectors] = useState(industries)
  const [website, setWebsite] = useState(websiteUrl)
  const [duration, setDuration] = useState(sessionDurationMinutes)
  const [enabled, setEnabled] = useState(availabilityEnabled)
  const [rows, setRows] = useState<WindowRow[]>(
    windows.map((window, index) => ({ ...window, key: `${window.weekday}-${window.startTime}-${index}` }))
  )
  const [customSector, setCustomSector] = useState("")

  const toggleSector = (tag: string) => {
    const has = sectors.some((item) => item.toLowerCase() === tag.toLowerCase())
    setSectors(
      has
        ? sectors.filter((item) => item.toLowerCase() !== tag.toLowerCase())
        : normalizeTagList([...sectors, tag])
    )
  }

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault()
        await onSave({
          industries: sectors,
          websiteUrl: website,
          sessionDurationMinutes: duration,
          availabilityEnabled: enabled,
          availabilityWindows: rows.map(({ weekday, startTime, endTime }) => ({
            weekday,
            startTime,
            endTime,
          })),
        })
      }}
    >
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Sectors</h2>
          <p className="text-xs text-muted-foreground">Members can filter the directory by more than one sector.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXPERT_SECTOR_SUGGESTIONS.map((tag) => {
            const active = sectors.some((item) => item.toLowerCase() === tag.toLowerCase())
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleSector(tag)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs",
                  active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                )}
              >
                {tag}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <Input
            value={customSector}
            onChange={(e) => setCustomSector(e.target.value)}
            placeholder="Add another sector"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                if (!customSector.trim()) return
                setSectors(normalizeTagList([...sectors, customSector]))
                setCustomSector("")
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (!customSector.trim()) return
              setSectors(normalizeTagList([...sectors, customSector]))
              setCustomSector("")
            }}
          >
            Add
          </Button>
        </div>
      </section>

      <section className="space-y-2">
        <Label htmlFor="website">Personal website</Label>
        <Input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://your-site.com"
        />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Session booking</h2>
          <p className="text-xs text-muted-foreground">
            Members pick an open slot. After they book, both of you get a session agenda and prep notes.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={enabled} onCheckedChange={(checked) => setEnabled(checked === true)} />
          Let members book these times on the platform
        </label>
        <div className="space-y-2">
          <Label>Session length</Label>
          <Select value={String(duration)} onValueChange={(value) => setDuration(Number(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPERT_SESSION_DURATIONS.map((minutes) => (
                <SelectItem key={minutes} value={String(minutes)}>
                  {minutes} minutes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.key} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2">
              <Select
                value={String(row.weekday)}
                onValueChange={(value) =>
                  setRows((current) =>
                    current.map((item) =>
                      item.key === row.key ? { ...item, weekday: Number(value) } : item
                    )
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue>{weekdayLabel(row.weekday)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EXPERT_WEEKDAYS.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="time"
                value={row.startTime}
                onChange={(e) =>
                  setRows((current) =>
                    current.map((item) =>
                      item.key === row.key ? { ...item, startTime: e.target.value } : item
                    )
                  )
                }
                className="w-[120px]"
              />
              <Input
                type="time"
                value={row.endTime}
                onChange={(e) =>
                  setRows((current) =>
                    current.map((item) =>
                      item.key === row.key ? { ...item, endTime: e.target.value } : item
                    )
                  )
                }
                className="w-[120px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
                aria-label="Remove window"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setRows((current) => [
                ...current,
                { key: `${Date.now()}`, weekday: 1, startTime: "09:00", endTime: "12:00" },
              ])
            }
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add weekly window
          </Button>
        </div>
      </section>

      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save availability
      </Button>
    </form>
  )
}
