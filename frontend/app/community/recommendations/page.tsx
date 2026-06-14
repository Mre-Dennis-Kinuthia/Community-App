"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Users } from "lucide-react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { RecommendationProfileCard } from "@/components/community/recommendation-profile-card"
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

  const recommendations = useMemo(() => {
    const connected = new Set(userConnections)
    return members.filter(
      (member) => !connected.has(member.id) && !skippedIds.includes(member.id)
    )
  }, [members, userConnections, skippedIds])

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
    <div className="community-directory community-pattern-bg -mx-4 min-h-[calc(100svh-8rem)] px-4 py-4 md:mx-0 md:rounded-xl md:border md:border-border md:px-6 md:py-6">
      <header className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/community")}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--cd-green)] hover:bg-[var(--cd-green)]/5"
          aria-label="Back to directory"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-[var(--cd-green)]">Recommendations</h1>
        <div className="w-10" aria-hidden />
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--cd-green)]" />
          <p className="mt-3 text-sm text-[var(--cd-green)]/60">Loading recommendations…</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/30 bg-white p-8 text-center">
          <p className="font-medium text-destructive">Could not load recommendations</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      ) : !current ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--cd-green)]/30 bg-white px-6 py-16 text-center">
          <Users className="mb-4 h-12 w-12 text-[var(--cd-green)]/40" />
          <p className="text-lg font-semibold text-[var(--cd-green)]">You&apos;re all caught up</p>
          <p className="mt-2 max-w-xs text-sm text-[var(--cd-green)]/65">
            No new recommendations right now. Browse the full directory to discover more members.
          </p>
          <Link
            href="/community"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-[var(--cd-navy)] px-6 text-sm font-semibold text-[var(--cd-yellow)]"
          >
            Back to directory
          </Link>
        </div>
      ) : (
        <div className="mx-auto max-w-md">
          <p className="mb-4 text-center text-xs text-[var(--cd-green)]/60">
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
