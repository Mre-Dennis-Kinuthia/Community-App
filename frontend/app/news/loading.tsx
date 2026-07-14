import { DashboardLayout } from "@/app/dashboard/layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function NewsLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
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
