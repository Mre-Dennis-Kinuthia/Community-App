"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Calendar, Loader2, Mail } from "lucide-react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MobileBreadcrumbsHidden } from "@/components/mobile/mobile-page-shell"
import { Button } from "@/components/ui/button"
import { NewsletterWebRenderer } from "@/lib/newsletter/render-web"
import type { NewsletterSection } from "@/lib/newsletter"

type Campaign = {
  title: string
  slug: string
  subject: string
  preheader: string | null
  brandPrimary: string | null
  brandAccent: string | null
  sentAt: string | null
  coverImageUrl?: string | null
  sections: NewsletterSection[]
}

export default function NewsletterDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/newsletters/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Not found")
        setCampaign(data.campaign)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs
            items={[
              { label: "Newsletters", href: "/newsletters" },
              {
                label: campaign?.title
                  ? campaign.title.length > 40
                    ? `${campaign.title.slice(0, 40)}…`
                    : campaign.title
                  : "Edition",
              },
            ]}
          />
        </MobileBreadcrumbsHidden>

        <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
          <Link href="/newsletters">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All newsletters
          </Link>
        </Button>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading edition…
          </div>
        ) : error || !campaign ? (
          <div className="rounded-xl border border-dashed px-6 py-16 text-center">
            <Mail className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              {error || "Newsletter not found"}
            </p>
            <Button variant="outline" asChild>
              <Link href="/newsletters">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to newsletters
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <header className="space-y-3">
              <div
                aria-hidden
                className="h-1.5 w-24 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${campaign.brandPrimary || "#822929"}, #ffd546)`,
                }}
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#822929]">
                Newsletter
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {campaign.title}
              </h1>
              {campaign.preheader || campaign.subject ? (
                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
                  {campaign.preheader || campaign.subject}
                </p>
              ) : null}
              {campaign.sentAt ? (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  Sent {format(new Date(campaign.sentAt), "MMMM d, yyyy")}
                </p>
              ) : null}
            </header>

            {campaign.coverImageUrl ? (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="relative aspect-[16/9] bg-muted sm:aspect-[16/7]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={campaign.coverImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ) : null}

            <div className="rounded-xl border border-border bg-card px-4 py-6 sm:px-8 sm:py-8">
              {campaign.sections?.length ? (
                <NewsletterWebRenderer
                  sections={
                    // Avoid repeating hero image already shown as cover
                    campaign.coverImageUrl
                      ? campaign.sections.map((s) =>
                          s.type === "hero" && s.imageUrl === campaign.coverImageUrl
                            ? { ...s, imageUrl: "" }
                            : s
                        )
                      : campaign.sections
                  }
                  brandPrimary={campaign.brandPrimary}
                  brandAccent={campaign.brandAccent}
                  variant="article"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  This edition has no content to display.
                </p>
              )}
            </div>

            <div className="border-t border-border pt-6">
              <Button variant="outline" asChild>
                <Link href="/newsletters">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to newsletters
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
