"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Loader2, ExternalLink, ArrowLeft, Calendar } from "lucide-react"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { OPPORTUNITY_STATUS_LABELS } from "@/lib/community-opportunity"
import type { OpportunityStatus } from "@/lib/community-opportunity"
import { OpportunityContent } from "@/components/opportunities/opportunity-content"
import { MobileBreadcrumbsHidden } from "@/components/mobile/mobile-page-shell"

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
      <div className="mx-auto w-full min-w-0 max-w-3xl overflow-x-hidden">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs
            items={[
              { label: "Programs & Resources", href: "/resources?tab=programs" },
              { label: opportunity?.title ?? "Opportunity" },
            ]}
          />
        </MobileBreadcrumbsHidden>

        <div className="space-y-4 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] md:space-y-6 md:pb-0">
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
            <Card>
              <CardContent className="px-4 py-10 text-center text-sm text-muted-foreground">
                {error || "Opportunity not found"}
              </CardContent>
            </Card>
          ) : (
            <>
              {flier ? (
                <div className="flex w-full min-w-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={flier}
                    alt=""
                    className="max-h-56 w-full object-contain sm:max-h-72 md:max-h-80"
                  />
                </div>
              ) : null}

              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {opportunity.featured ? (
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs">
                      Featured
                    </Badge>
                  ) : null}
                  <Badge variant="outline" className="text-[10px] sm:text-xs">
                    {statusLabel}
                  </Badge>
                  {opportunity.source ? (
                    <Badge
                      variant="secondary"
                      className="max-w-full truncate text-[10px] sm:text-xs"
                    >
                      via {opportunity.source}
                    </Badge>
                  ) : null}
                </div>

                <h1 className="break-words text-lg font-semibold leading-snug tracking-tight sm:text-xl md:text-2xl">
                  {opportunity.title}
                </h1>

                {opportunity.summary ? (
                  <p className="break-words text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {opportunity.summary}
                  </p>
                ) : null}

                <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-3 sm:text-sm">
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
                        className="max-w-full truncate text-[10px] font-normal sm:text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>

              <Card className="min-w-0 overflow-hidden border-border">
                <CardContent className="min-w-0 px-3 py-4 sm:px-5 sm:py-5">
                  <OpportunityContent html={opportunity.content} />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {opportunity && !loading && !error ? (
          <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/90 md:static md:mt-4 md:rounded-lg md:border md:px-0 md:py-0 md:shadow-none">
            <div className="mx-auto w-full max-w-3xl md:rounded-lg md:border md:border-border md:bg-background md:p-4 md:shadow-sm">
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
              <p className="mt-2 text-center text-[11px] leading-snug text-muted-foreground sm:text-xs">
                You&apos;ll leave Impact Hub Nairobi to complete your application.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}
