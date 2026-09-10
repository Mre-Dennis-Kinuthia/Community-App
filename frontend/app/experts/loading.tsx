import { DashboardLayout } from "@/app/dashboard/layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExpertsLoading() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-3 md:space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 md:h-9 md:w-64" />
          <Skeleton className="h-4 w-full max-w-md md:h-5 md:w-96" />
        </div>
        <div className="hidden grid-cols-3 gap-2 md:grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2">
              <Skeleton className="h-3.5 w-3.5 shrink-0 rounded-sm" />
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 md:hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-20 rounded-lg" />
          ))}
        </div>
        <div className="hidden gap-3 md:flex">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-[180px]" />
          <Skeleton className="h-9 w-[180px]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-xl border border-border bg-card px-4 py-5"
            >
              <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
              <Skeleton className="mt-3 h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-24" />
              <Skeleton className="mt-3 h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
