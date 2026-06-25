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
import {
  MobileBreadcrumbsHidden,
  MobilePageHeader,
} from "@/components/mobile/mobile-page-shell"
import { cn } from "@/lib/utils"

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
      <div className="mx-auto w-full max-w-3xl min-w-0 space-y-4 overflow-x-hidden pb-4 md:space-y-6 md:pb-0">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs
            items={[
              { label: "Programs & Resources", href: "/resources?tab=programs" },
              { label: opportunity?.title ?? "Opportunity" },
            ]}
          />
        </MobileBreadcrumbsHidden>

        <Button variant="ghost" size="sm" className="-ml-2 gap-2" asChild>
          <Link href="/resources?tab=programs">
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span className="truncate">Opportunities</span>
          </Link>
        </Button>

        {loading ? (
          <div className="flex justify-center py-16 md:py-20">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : error || !opportunity ? (
          <Card>
            <CardContent className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6 sm:py-12">
              {error || "Opportunity not found"}
            </CardContent>
          </Card>
        ) : (
          <>
            {flier ? (
              <div className="overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flier}
                  alt=""
                  className="max-h-48 w-full object-cover sm:max-h-64 md:max-h-80"
                />
              </div>
            ) : null}

            <MobilePageHeader
              title={opportunity.title}
              description={opportunity.summary ?? undefined}
              className="md:hidden"
            />

            <div className="hidden space-y-4 md:block">
              <div className="flex flex-wrap gap-2">
                {opportunity.featured ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20">Featured</Badge>
                ) : null}
                <Badge variant="outline">{statusLabel}</Badge>
                {opportunity.source ? (
                  <Badge variant="secondary" className="max-w-full truncate">
                    via {opportunity.source}
                  </Badge>
                ) : null}
              </div>

              <h1 className="break-words text-2xl font-semibold tracking-tight md:text-3xl">
                {opportunity.title}
              </h1>

              {opportunity.summary ? (
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                  {opportunity.summary}
                </p>
              ) : null}
            </div>

            <div className="space-y-3 md:hidden">
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
                  <Badge variant="secondary" className="max-w-[12rem] truncate text-[10px]">
                    via {opportunity.source}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-4 sm:text-sm">
              {opportunity.deadline ? (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                  <span className="truncate">
                    Apply by {format(new Date(opportunity.deadline), "MMM d, yyyy")}
                  </span>
                </span>
              ) : null}
              {opportunity.publishedAt ? (
                <span className="truncate">
                  Posted {format(new Date(opportunity.publishedAt), "MMM d, yyyy")}
                </span>
              ) : null}
            </div>

            {opportunity.tags.length > 0 ? (
              <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                <Tag className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                {opportunity.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="max-w-[10rem] truncate text-[10px] font-normal sm:max-w-none sm:text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            <Card className="border-border">
              <CardContent className="px-3 py-4 sm:px-6 sm:pt-6">
                <div
                  className="prose prose-sm max-w-none break-words dark:prose-invert prose-headings:font-semibold prose-headings:break-words prose-p:break-words prose-a:text-primary prose-a:underline-offset-2 prose-a:break-all prose-img:max-w-full prose-img:h-auto prose-table:block prose-table:max-w-full prose-table:overflow-x-auto prose-pre:max-w-full prose-pre:overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: opportunity.content }}
                />
              </CardContent>
            </Card>

            {/* Spacer so content is not hidden behind mobile apply bar */}
            <div className="h-24 md:hidden" aria-hidden />

            <div
              className={cn(
                "border border-border bg-background/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80",
                "fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-40 md:static md:rounded-lg md:p-4"
              )}
            >
              {opportunity.canApply ? (
                <Button className="h-11 w-full gap-2 sm:h-10" size="lg" asChild>
                  <a href={opportunity.applyUrl} target="_blank" rel="noopener noreferrer">
                    Apply on host site
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </a>
                </Button>
              ) : (
                <Button className="h-11 w-full sm:h-10" size="lg" variant="secondary" disabled>
                  Applications closed
                </Button>
              )}
              <p className="mt-2 text-center text-[11px] text-muted-foreground sm:text-xs">
                You&apos;ll leave Impact Hub Nairobi to complete your application.
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
