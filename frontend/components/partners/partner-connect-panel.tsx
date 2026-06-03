"use client"

import { ExternalLink, Mail, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PartnerBadges } from "@/components/partners/partner-badges"
import type { Partner } from "@/types/partner"
import { partnerMailto } from "@/lib/partner-utils"

type PartnerConnectPanelProps = {
  partner: Partner
}

export function PartnerConnectPanel({ partner }: PartnerConnectPanelProps) {
  const contactHref = partner.contactEmail
    ? partnerMailto(partner.contactEmail, `Partnership inquiry: ${partner.name}`)
    : null

  return (
    <div className="space-y-4 lg:sticky lg:top-6">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Connect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {partner.website ? (
            <Button className="w-full" asChild>
              <a href={partner.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit website
              </a>
            </Button>
          ) : null}
          {contactHref ? (
            <Button variant="outline" className="w-full" asChild>
              <a href={contactHref}>
                <Mail className="mr-2 h-4 w-4" />
                Email partner
              </a>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">At a glance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <PartnerBadges
            type={partner.type}
            category={partner.category}
            locationType={partner.locationType}
            featured={partner.isFeatured}
          />
          {partner.location ? (
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">{partner.location}</p>
            </div>
          ) : null}
          <div>
            <p className="text-muted-foreground">Opportunities</p>
            <p className="inline-flex items-center gap-1.5 font-medium">
              <Target className="h-4 w-4 text-muted-foreground" />
              {partner.opportunitiesCount}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
