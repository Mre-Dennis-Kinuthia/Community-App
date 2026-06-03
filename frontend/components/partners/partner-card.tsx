"use client"

import Link from "next/link"
import { ExternalLink, MapPin, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Partner } from "@/types/partner"
import { PartnerBadges } from "@/components/partners/partner-badges"
import { PartnerLogo } from "@/components/partners/partner-logo"

type PartnerCardProps = {
  partner: Partner
}

export function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <Link href={`/partners/${partner.id}`} className="group block h-full">
      <Card className="h-full border-border transition-colors hover:border-primary/40 hover:bg-muted/20">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-start gap-4">
            <PartnerLogo name={partner.name} logoUrl={partner.logoUrl} size="md" />
            <div className="min-w-0 flex-1 space-y-2">
              <PartnerBadges
                type={partner.type}
                category={partner.category}
                locationType={partner.locationType}
                featured={partner.isFeatured}
              />
              <h3 className="text-lg font-semibold leading-snug group-hover:text-primary">
                {partner.name}
              </h3>
              {partner.description ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">{partner.description}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {partner.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {partner.location}
                </span>
              ) : null}
              {partner.opportunitiesCount > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 shrink-0" />
                  {partner.opportunitiesCount}{" "}
                  {partner.opportunitiesCount === 1 ? "opportunity" : "opportunities"}
                </span>
              ) : null}
            </div>

            {partner.focus.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {partner.focus.slice(0, 3).map((area) => (
                  <Badge key={area} variant="outline" className="text-xs font-normal">
                    {area}
                  </Badge>
                ))}
                {partner.focus.length > 3 ? (
                  <Badge variant="outline" className="text-xs font-normal">
                    +{partner.focus.length - 3}
                  </Badge>
                ) : null}
              </div>
            ) : null}

            {partner.website ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.open(partner.website!, "_blank", "noopener,noreferrer")
                }}
              >
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                Visit website
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
