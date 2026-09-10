import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExpertsLoading() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-3 md:space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 md:h-9 md:w-64" />
          <Skeleton className="h-4 w-full max-w-md md:h-5 md:w-96" />
        </div>
        <div className="hidden grid-cols-3 gap-3 md:grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-md border border-border bg-card px-4 py-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-8 w-16" />
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
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="space-y-4 p-5">
                <div className="flex gap-4">
                  <Skeleton className="h-14 w-14 shrink-0 rounded-full md:h-16 md:w-16" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
