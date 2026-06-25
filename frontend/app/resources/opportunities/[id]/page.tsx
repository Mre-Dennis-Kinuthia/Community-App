"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ExternalLink, ArrowLeft, Calendar } from "lucide-react"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { OPPORTUNITY_STATUS_LABELS } from "@/lib/community-opportunity"
import type { OpportunityStatus } from "@/lib/community-opportunity"
import { OpportunityContent } from "@/components/opportunities/opportunity-content"

type OpportunityDetail = {
  id: string
  title: string
  summary: string | null
  content: string
  flierUrl: string | null
  applyUrl: string
  tags: string[]
  source: string | null
  status: string
  featured: boolean
  deadline: string | null
  publishedAt: string | null
  canApply: boolean
}

export default function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState<string | null>(null)
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`/api/opportunities/${id}`, { credentials: "include" })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Not found")
        setOpportunity(data.opportunity)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const flier = opportunity?.flierUrl ? getImageDisplayUrl(opportunity.flierUrl) : undefined
  const statusLabel =
    OPPORTUNITY_STATUS_LABELS[opportunity?.status as OpportunityStatus] ?? opportunity?.status

  return (
    <DashboardLayout>
      {/* min-w-0 is required: flex parents otherwise expand to wide HTML/images */}
      <article className="w-full min-w-0 max-w-full space-y-4 md:mx-auto md:max-w-3xl md:space-y-6">
        <Button variant="ghost" size="sm" className="-ml-2 h-9 gap-2 px-2" asChild>
          <Link href="/resources?tab=programs">
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Opportunities
          </Link>
        </Button>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : error || !opportunity ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {error || "Opportunity not found"}
          </p>
        ) : (
          <>
            {flier ? (
              <div className="w-full min-w-0 overflow-hidden rounded-lg border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flier}
                  alt=""
                  className="block h-auto w-full max-w-full object-contain"
                />
              </div>
            ) : null}

            <header className="w-full min-w-0 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {opportunity.featured ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                    Featured
                  </Badge>
                ) : null}
                <Badge variant="outline" className="text-[10px]">
                  {statusLabel}
                </Badge>
                {opportunity.source ? (
                  <Badge variant="secondary" className="max-w-full truncate text-[10px]">
                    via {opportunity.source}
                  </Badge>
                ) : null}
              </div>

              <h1 className="w-full min-w-0 break-words text-lg font-semibold leading-snug tracking-tight sm:text-xl">
                {opportunity.title}
              </h1>

              {opportunity.summary ? (
                <p className="w-full min-w-0 break-words text-sm leading-relaxed text-muted-foreground">
                  {opportunity.summary}
                </p>
              ) : null}

              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                {opportunity.deadline ? (
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span className="break-words">
                      Apply by {format(new Date(opportunity.deadline), "MMM d, yyyy")}
                    </span>
                  </span>
                ) : null}
                {opportunity.publishedAt ? (
                  <span className="break-words">
                    Posted {format(new Date(opportunity.publishedAt), "MMM d, yyyy")}
                  </span>
                ) : null}
              </div>

              {opportunity.tags.length > 0 ? (
                <div className="flex min-w-0 flex-wrap gap-1.5">
                  {opportunity.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="max-w-full truncate text-[10px] font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </header>

            <section className="w-full min-w-0 overflow-x-clip rounded-lg border border-border bg-card px-3 py-4 sm:px-4">
              <OpportunityContent html={opportunity.content} />
            </section>

            <footer className="w-full min-w-0 space-y-2 border-t border-border pt-4">
              {opportunity.canApply ? (
                <Button className="h-11 w-full gap-2" size="lg" asChild>
                  <a href={opportunity.applyUrl} target="_blank" rel="noopener noreferrer">
                    Apply on host site
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </a>
                </Button>
              ) : (
                <Button className="h-11 w-full" size="lg" variant="secondary" disabled>
                  Applications closed
                </Button>
              )}
              <p className="text-center text-[11px] leading-snug text-muted-foreground">
                You&apos;ll leave Impact Hub Nairobi to complete your application.
              </p>
            </footer>
          </>
        )}
      </article>
    </DashboardLayout>
  )
}
