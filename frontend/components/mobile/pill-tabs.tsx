"use client"

import { cn } from "@/lib/utils"

export interface PillTabItem {
  value: string
  label: string
  count?: number
}

interface PillTabsProps {
  items: PillTabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function PillTabs({ items, value, onChange, className }: PillTabsProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl bg-muted/40 p-1",
        className
      )}
      role="tablist"
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
            {item.count != null && (
              <span
                className={cn(
                  "text-xs tabular-nums",
                  active ? "text-foreground/70" : "text-muted-foreground"
                )}
              >
                ({item.count})
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
