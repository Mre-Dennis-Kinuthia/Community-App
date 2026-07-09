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
    <div className={cn("min-w-0 space-y-0.5", className)}>
      <h1 className="page-title">{title}</h1>
      {description ? <p className="page-lead max-w-2xl">{description}</p> : null}
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
    <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
      {items.map((stat) => (
        <div
          key={stat.label}
          className="flex min-w-[5.25rem] max-w-[7.5rem] shrink-0 flex-col rounded-lg border border-border/60 bg-muted/25 px-2.5 py-2"
        >
          {stat.icon && <stat.icon className="mb-0.5 h-3 w-3 text-primary/70" aria-hidden />}
          <span className="truncate text-base font-semibold tabular-nums leading-none">
            {loading ? "—" : stat.value}
          </span>
          <span className="mt-0.5 truncate text-[10px] leading-tight text-muted-foreground">
            {stat.label}
          </span>
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
    <div
      className={cn(
        "flex items-center justify-between text-[11px] text-muted-foreground md:hidden",
        className
      )}
    >
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
