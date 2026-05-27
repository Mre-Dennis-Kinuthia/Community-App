"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MemberProfileView } from "@/components/community/member-profile-view"
import { useCommunityMember } from "@/lib/hooks/use-community"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { member, isLoading, error, refetch } = useCommunityMember(id)

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-5xl space-y-6">
          <Breadcrumbs items={[{ label: "Community", href: "/community" }, { label: "…" }]} />
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" aria-hidden />
              <p className="text-sm text-muted-foreground">Loading member profile…</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !member) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-5xl space-y-6">
          <Breadcrumbs items={[{ label: "Community", href: "/community" }, { label: "Not found" }]} />
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-3" />
              <p className="text-muted-foreground mb-4">{error || "This member could not be found."}</p>
              <Button onClick={() => router.push("/community")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to community
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <MemberProfileView member={member} onRefresh={() => refetch()} />
    </DashboardLayout>
  )
}
