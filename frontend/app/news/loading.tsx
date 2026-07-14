import { DashboardLayout } from "@/app/dashboard/layout"
import { Skeleton } from "@/components/ui/skeleton"

/** Mirrors ListPageShell structure (max-w-5xl, breadcrumb row, spacing) to avoid layout shift. */
export default function NewsLoading() {
  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-5xl space-y-3 overflow-x-hidden md:space-y-6">
        {/* Breadcrumbs (desktop only, like MobileBreadcrumbsHidden) */}
        <div className="hidden md:block">
          <Skeleton className="h-5 w-44" />
        </div>

        {/* Page header */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 md:h-8" />
          <Skeleton className="h-4 w-80 max-w-full md:h-5" />
        </div>

        {/* Desktop filter bar (bordered card like FilterBar) */}
        <div className="hidden rounded-md border border-border bg-card p-4 md:block">
          <Skeleton className="h-9 w-full max-w-md" />
        </div>

        {/* Mobile search */}
        <div className="space-y-2 md:hidden">
          <Skeleton className="h-9 w-full" />
        </div>

        {/* Hero */}
        <Skeleton className="aspect-[16/9] w-full rounded-xl md:aspect-[21/9]" />

        {/* Featured pair */}
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border">
              <Skeleton className="aspect-[16/9] w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border">
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
