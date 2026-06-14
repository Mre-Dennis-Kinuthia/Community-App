"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Users } from "lucide-react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Button } from "@/components/ui/button"
import { RecommendationProfileCard } from "@/components/community/recommendation-profile-card"
import { getRecommendedMembers } from "@/lib/community-recommendations"
import { useCommunityMembers } from "@/lib/hooks/use-community"
import { toast } from "@/lib/toast"

function RecommendationsContent() {
  const router = useRouter()
  const [skippedIds, setSkippedIds] = useState<string[]>([])
  const [contactLoading, setContactLoading] = useState(false)

  const { members, userConnections, isLoading, error, refetch } = useCommunityMembers({
    limit: 100,
    sort: "most_connected",
  })

  const recommendations = useMemo(
    () => getRecommendedMembers(members, userConnections, { excludeIds: skippedIds }),
    [members, userConnections, skippedIds]
  )

  const current = recommendations[0]

  const handleIgnore = () => {
    if (!current) return
    setSkippedIds((prev) => [...prev, current.id])
  }

  const handleContact = async () => {
    if (!current) return
    setContactLoading(true)
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: current.id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Could not send connection request")
      }
      toast.success("Request sent", "They will see your connection request in the hub.")
      setSkippedIds((prev) => [...prev, current.id])
      void refetch()
    } catch (e) {
      toast.error("Connection failed", e instanceof Error ? e.message : "Please try again.")
    } finally {
      setContactLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.push("/community")}
          aria-label="Back to directory"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Recommendations</h1>
        <div className="w-9" aria-hidden />
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading recommendations…</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-card p-8 text-center">
          <p className="font-medium text-destructive">Could not load recommendations</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : !current ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-semibold">You&apos;re all caught up</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            No new recommendations right now. Browse the full directory to discover more members.
          </p>
          <Button asChild className="mt-6">
            <Link href="/community">Back to directory</Link>
          </Button>
        </div>
      ) : (
        <div className="mx-auto max-w-md">
          <p className="mb-4 text-center text-xs text-muted-foreground">
            {recommendations.length} recommendation{recommendations.length !== 1 ? "s" : ""} left
          </p>
          <RecommendationProfileCard
            member={current}
            onIgnore={handleIgnore}
            onContact={handleContact}
            contactLoading={contactLoading}
          />
        </div>
      )}
    </div>
  )
}

export default function RecommendationsPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <RecommendationsContent />
      </Suspense>
    </DashboardLayout>
  )
}
