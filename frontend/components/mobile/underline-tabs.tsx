"use client"

import { cn } from "@/lib/utils"

export interface UnderlineTabItem {
  value: string
  label: string
}

interface UnderlineTabsProps {
  items: UnderlineTabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function UnderlineTabs({ items, value, onChange, className }: UnderlineTabsProps) {
  return (
    <div
      className={cn("flex gap-6 border-b border-border", className)}
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
              "relative -mb-px pb-3 text-sm font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}
