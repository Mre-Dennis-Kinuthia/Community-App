"use client"

import { PlatformIcon } from "@/components/platform-icon"
import { cn } from "@/lib/utils"

interface FilterChipProps {
  label: string
  iconSrc?: string
  active?: boolean
  onClick?: () => void
  count?: number
  className?: string
}

export function FilterChip({ label, iconSrc, active, onClick, count, className }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
        "min-h-[36px] active:scale-[0.98]",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted/50 text-foreground/80 hover:bg-muted",
        className
      )}
    >
      {iconSrc ? (
        <PlatformIcon
          src={iconSrc}
          alt=""
          size={16}
          className={active ? "brightness-0 invert" : undefined}
        />
      ) : null}
      {label}
      {count != null && count > 0 && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
            active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}
