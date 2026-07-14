"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type MembershipSummary = {
  tier?: string | null
  label?: string | null
}

const TIER_STYLES: Record<string, string> = {
  community: "bg-muted text-muted-foreground",
  star_connect: "bg-primary/10 text-primary border-primary/20",
  organisational: "bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-300",
}

export function MembershipTierBadge({
  membership,
  className,
  interactive = false,
  onClick,
}: {
  membership?: MembershipSummary | null
  className?: string
  /** When true, renders as a button that opens an associated dialog. */
  interactive?: boolean
  onClick?: () => void
}) {
  const label = membership?.label
  const tier = membership?.tier ?? "community"
  if (!label) return null

  const styles = cn(
    "font-medium",
    TIER_STYLES[tier] ?? "",
    interactive &&
      "cursor-pointer transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    className
  )

  if (interactive) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onClick?.()
        }}
        aria-haspopup="dialog"
        aria-label={`View ${label} membership card`}
        className={cn(
          "inline-flex items-center justify-center rounded-sm border px-2 py-0.5 text-xs",
          "w-fit whitespace-nowrap shrink-0",
          styles
        )}
      >
        {label}
      </button>
    )
  }

  return (
    <Badge variant="outline" className={styles}>
      {label}
    </Badge>
  )
}
