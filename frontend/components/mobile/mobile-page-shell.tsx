"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobilePageHeaderProps {
  title: string
  description?: string
  className?: string
}

export function MobilePageHeader({ title, description, className }: MobilePageHeaderProps) {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">{title}</h1>
      {description ? (
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export interface MobileStatItem {
  label: string
  value: string | number
  icon?: LucideIcon
}

interface MobileStatsStripProps {
  items: MobileStatItem[]
  loading?: boolean
}

export function MobileStatsStrip({ items, loading }: MobileStatsStripProps) {
  return (
    <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
      {items.map((stat) => (
        <div
          key={stat.label}
          className="flex min-w-[6.5rem] max-w-[9rem] shrink-0 flex-col rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5"
        >
          {stat.icon && <stat.icon className="mb-1 h-3.5 w-3.5 text-primary/70" />}
          <span className="truncate text-lg font-semibold tabular-nums leading-none">
            {loading ? "—" : stat.value}
          </span>
          <span className="mt-1 text-[10px] text-muted-foreground">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}

interface MobileFilterMetaProps {
  count: number
  countLabel?: string
  filterCount?: number
  hasFilters?: boolean
  onClear?: () => void
  className?: string
}

export function MobileFilterMeta({
  count,
  countLabel = "results",
  filterCount = 0,
  hasFilters,
  onClear,
  className,
}: MobileFilterMetaProps) {
  return (
    <div className={cn("flex items-center justify-between text-xs text-muted-foreground md:hidden", className)}>
      <span>
        {count} {countLabel}
        {filterCount > 0 && ` · ${filterCount} filter${filterCount !== 1 ? "s" : ""}`}
      </span>
      {hasFilters && onClear && (
        <button type="button" onClick={onClear} className="font-medium text-primary">
          Clear
        </button>
      )}
    </div>
  )
}

interface MobileSearchFilterRowProps {
  search: React.ReactNode
  filterTrigger: React.ReactNode
}

export function MobileSearchFilterRow({ search, filterTrigger }: MobileSearchFilterRowProps) {
  return (
    <div className="flex gap-2 md:hidden">
      <div className="min-w-0 flex-1">{search}</div>
      {filterTrigger}
    </div>
  )
}

export function MobileBreadcrumbsHidden({ children }: { children: React.ReactNode }) {
  return <div className="hidden md:block">{children}</div>
}
