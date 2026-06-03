"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Loader2, ExternalLink, ArrowLeft, Calendar, Tag } from "lucide-react"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { OPPORTUNITY_STATUS_LABELS } from "@/lib/community-opportunity"
import type { OpportunityStatus } from "@/lib/community-opportunity"

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
      <div className="mx-auto max-w-3xl space-y-6">
        <Breadcrumbs
          items={[
            { label: "Programs & Resources", href: "/resources?tab=programs" },
            { label: opportunity?.title ?? "Opportunity" },
          ]}
        />

        <Button variant="ghost" size="sm" className="-ml-2 gap-2" asChild>
          <Link href="/resources?tab=programs">
            <ArrowLeft className="h-4 w-4" />
            All opportunities
          </Link>
        </Button>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error || !opportunity ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {error || "Opportunity not found"}
            </CardContent>
          </Card>
        ) : (
          <>
            {flier ? (
              <div className="overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flier} alt="" className="max-h-80 w-full object-cover" />
              </div>
            ) : null}

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {opportunity.featured ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20">Featured</Badge>
                ) : null}
                <Badge variant="outline">{statusLabel}</Badge>
                {opportunity.source ? (
                  <Badge variant="secondary">via {opportunity.source}</Badge>
                ) : null}
              </div>

              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {opportunity.title}
              </h1>

              {opportunity.summary ? (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {opportunity.summary}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {opportunity.deadline ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Apply by {format(new Date(opportunity.deadline), "PPP")}
                  </span>
                ) : null}
                {opportunity.publishedAt ? (
                  <span>Posted {format(new Date(opportunity.publishedAt), "MMM d, yyyy")}</span>
                ) : null}
              </div>

              {opportunity.tags.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {opportunity.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            <Card className="border-border">
              <CardContent className="prose prose-sm max-w-none pt-6 dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {opportunity.content}
                </div>
              </CardContent>
            </Card>

            <div className="sticky bottom-4 rounded-lg border border-border bg-background/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
              {opportunity.canApply ? (
                <Button className="w-full gap-2" size="lg" asChild>
                  <a href={opportunity.applyUrl} target="_blank" rel="noopener noreferrer">
                    Apply on host site
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button className="w-full" size="lg" variant="secondary" disabled>
                  Applications closed
                </Button>
              )}
              <p className="mt-2 text-center text-xs text-muted-foreground">
                You&apos;ll leave Impact Hub Nairobi to complete your application.
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
