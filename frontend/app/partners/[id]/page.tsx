"use client"

import { use } from "react"
import useSWR from "swr"
import Link from "next/link"
import { ArrowLeft, Loader2, MapPin, Target } from "lucide-react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MobilePageHeader, MobileBreadcrumbsHidden } from "@/components/mobile/mobile-page-shell"
import { PartnerBadges } from "@/components/partners/partner-badges"
import { PartnerLogo } from "@/components/partners/partner-logo"
import { PartnerConnectPanel } from "@/components/partners/partner-connect-panel"
import { PartnerOpportunityList } from "@/components/partners/partner-opportunity-list"
import { normalizePartner } from "@/lib/partner-utils"
import type { Partner } from "@/types/partner"

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data, error, isLoading } = useSWR<{ partner: Partner }>(
    `/api/partners/${id}`,
    async (url) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error("Partner not found")
      const json = await res.json()
      return { partner: normalizePartner(json.partner) }
    }
  )

  const partner = data?.partner

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !partner) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-5xl space-y-6">
          <Breadcrumbs items={[{ label: "Partners & Network", href: "/partners" }, { label: "Not found" }]} />
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="mb-4 text-sm text-muted-foreground">
                {error?.message || "This partner could not be found."}
              </p>
              <Button asChild>
                <Link href="/partners">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to partners
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const opportunities = partner.opportunities ?? []

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-5xl space-y-6 overflow-x-hidden">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs
            items={[{ label: "Partners & Network", href: "/partners" }, { label: partner.name }]}
          />
        </MobileBreadcrumbsHidden>

        <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
          <Link href="/partners">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All partners
          </Link>
        </Button>

        <MobilePageHeader title={partner.name} description={partner.description} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-border">
              <CardContent className="space-y-5 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <PartnerLogo name={partner.name} logoUrl={partner.logoUrl} size="lg" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <PartnerBadges
                      type={partner.type}
                      category={partner.category}
                      locationType={partner.locationType}
                      featured={partner.isFeatured}
                    />
                    <p className="text-base text-muted-foreground">{partner.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {partner.location ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {partner.location}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1.5">
                        <Target className="h-4 w-4" />
                        {partner.opportunitiesCount}{" "}
                        {partner.opportunitiesCount === 1 ? "opportunity" : "opportunities"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {partner.focus.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Focus areas</h2>
                <div className="flex flex-wrap gap-2">
                  {partner.focus.map((area) => (
                    <Badge key={area} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}

            <PartnerOpportunityList partner={partner} opportunities={opportunities} />
          </div>

          <PartnerConnectPanel partner={partner} />
        </div>
      </div>
    </DashboardLayout>
  )
}
