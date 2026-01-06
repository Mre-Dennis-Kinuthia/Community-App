import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function NewsLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-7 w-32" />
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-7 w-32" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

