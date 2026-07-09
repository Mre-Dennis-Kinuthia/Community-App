"use client"

import type { ReactNode } from "react"
import { Loader2, Search } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MobilePageHeader,
  MobileStatsStrip,
  MobileFilterMeta,
  MobileBreadcrumbsHidden,
  type MobileStatItem,
} from "@/components/mobile/mobile-page-shell"
import { FilterBar } from "@/components/design/filter-bar"
import { EmptyState } from "@/components/design/empty-state"
import { cn } from "@/lib/utils"

export interface ListPageShellProps {
  breadcrumb: string
  title: string
  description?: string
  actions?: ReactNode
  stats?: MobileStatItem[]
  statsLoading?: boolean
  /** Desktop metric cards or summary row — hidden on mobile when stats strip is used */
  metrics?: ReactNode
  /** Tabs, pills, or other controls below the header */
  toolbar?: ReactNode
  mobileFilters?: ReactNode
  desktopFilters?: ReactNode
  filterChips?: ReactNode
  resultCount?: number
  resultLabel?: string
  filterCount?: number
  hasActiveFilters?: boolean
  onClearFilters?: () => void
  /** Applied-filters badge shown on desktop below the filter bar */
  showDesktopFilterBadge?: boolean
  children?: ReactNode
  className?: string
  maxWidth?: "5xl" | "full"
}

export function ListPageShell({
  breadcrumb,
  title,
  description,
  actions,
  stats,
  statsLoading,
  metrics,
  toolbar,
  mobileFilters,
  desktopFilters,
  filterChips,
  resultCount,
  resultLabel = "results",
  filterCount = 0,
  hasActiveFilters,
  onClearFilters,
  showDesktopFilterBadge = true,
  children,
  className,
  maxWidth = "5xl",
}: ListPageShellProps) {
  const showMobileMeta =
    resultCount !== undefined &&
    (mobileFilters !== undefined || filterCount > 0 || hasActiveFilters)

  return (
    <div
      className={cn(
        "mx-auto w-full space-y-3 overflow-x-hidden md:space-y-6",
        maxWidth === "5xl" && "max-w-5xl",
        className
      )}
    >
      <MobileBreadcrumbsHidden>
        <Breadcrumbs items={[{ label: breadcrumb }]} />
      </MobileBreadcrumbsHidden>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between md:gap-4">
        <MobilePageHeader title={title} description={description} className="flex-1" />
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>

      {stats && stats.length > 0 ? (
        <MobileStatsStrip items={stats} loading={statsLoading} />
      ) : null}

      {metrics ? <div className="hidden md:block">{metrics}</div> : null}

      {toolbar}

      {mobileFilters ? (
        <div className="space-y-2 md:hidden">
          {mobileFilters}
          {showMobileMeta ? (
            <MobileFilterMeta
              count={resultCount ?? 0}
              countLabel={resultLabel}
              filterCount={filterCount}
              hasFilters={hasActiveFilters}
              onClear={onClearFilters}
            />
          ) : null}
        </div>
      ) : null}

      {desktopFilters ? (
        <div className="hidden md:block">
          <FilterBar className="rounded-md border border-border bg-card p-4">
            {desktopFilters}
          </FilterBar>
          {showDesktopFilterBadge && filterCount > 0 && resultCount !== undefined ? (
            <Badge variant="secondary" className="mt-2">
              {filterCount} filter{filterCount !== 1 ? "s" : ""} applied · {resultCount}{" "}
              {resultLabel}
            </Badge>
          ) : null}
        </div>
      ) : null}

      {filterChips}

      {children}
    </div>
  )
}

interface ListPageSearchFieldProps {
  value: string
  onChange: (value: string) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
}

export function ListPageSearchField({
  value,
  onChange,
  onKeyDown,
  placeholder = "Search…",
  className,
}: ListPageSearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="h-8 pl-8 text-sm md:h-9"
      />
    </div>
  )
}

interface ListPageBodyProps {
  loading?: boolean
  loadingMessage?: string
  error?: string | null
  errorAction?: ReactNode
  isEmpty?: boolean
  empty?: ReactNode
  children?: ReactNode
}

export function ListPageBody({
  loading,
  loadingMessage = "Loading…",
  error,
  errorAction,
  isEmpty,
  empty,
  children,
}: ListPageBodyProps) {
  if (loading) {
    return <ListPageLoading message={loadingMessage} />
  }
  if (error) {
    return (
      <EmptyState
        title="Could not load content"
        description={error}
        action={errorAction}
      />
    )
  }
  if (isEmpty && empty) {
    return empty
  }
  return children
}

export function ListPageLoading({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground md:py-16">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {message}
    </div>
  )
}

/** Label + children for mobile filter sheet sections */
export function ListPageFilterSection({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}
