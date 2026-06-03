"use client"

import { format } from "date-fns"
import { Calendar, CheckCircle2, DollarSign, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Partner, PartnerOpportunity } from "@/types/partner"
import {
  PARTNER_OPPORTUNITY_CATEGORY_STYLES,
  partnerMailto,
} from "@/lib/partner-utils"

type PartnerOpportunityListProps = {
  partner: Partner
  opportunities: PartnerOpportunity[]
}

function OpportunityCard({
  opportunity,
  partner,
}: {
  opportunity: PartnerOpportunity
  partner: Partner
}) {
  const isOpen = opportunity.status.toLowerCase() === "open"
  const contactHref =
    partner.contactEmail && isOpen
      ? partnerMailto(
          partner.contactEmail,
          `Inquiry: ${opportunity.title}`,
          `Hi,\n\nI am an Impact Hub member interested in "${opportunity.title}".\n\n`
        )
      : null

  return (
    <Card className="border-border">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {opportunity.category ? (
            <Badge
              className={
                PARTNER_OPPORTUNITY_CATEGORY_STYLES[opportunity.category] ??
                PARTNER_OPPORTUNITY_CATEGORY_STYLES.Resource
              }
            >
              {opportunity.category}
            </Badge>
          ) : null}
          <Badge variant={isOpen ? "default" : "secondary"}>{opportunity.status}</Badge>
          {opportunity.deadline ? (
            <Badge variant="outline" className="text-xs font-normal">
              <Calendar className="mr-1 h-3 w-3" />
              Deadline {format(new Date(opportunity.deadline), "MMM d, yyyy")}
            </Badge>
          ) : null}
        </div>
        <CardTitle className="text-lg">{opportunity.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{opportunity.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {(opportunity.amount || opportunity.deadline) && (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {opportunity.amount ? (
              <span className="inline-flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                {opportunity.amount}
              </span>
            ) : null}
          </div>
        )}

        {opportunity.eligibility.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium">Eligibility</p>
            <ul className="space-y-1.5">
              {opportunity.eligibility.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {opportunity.applicationProcess.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium">How to apply</p>
            <ol className="space-y-1.5">
              {opportunity.applicationProcess.map((step, index) => (
                <li key={`${index}-${step}`} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {contactHref ? (
          <Button asChild className="w-full sm:w-auto">
            <a href={contactHref}>
              <Mail className="mr-2 h-4 w-4" />
              Contact about this opportunity
            </a>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function PartnerOpportunityList({ partner, opportunities }: PartnerOpportunityListProps) {
  if (opportunities.length === 0) return null

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Partner opportunities</h2>
        <p className="text-sm text-muted-foreground">
          Programs, funding, and resources offered directly through this partner.
        </p>
      </div>
      <div className="space-y-4">
        {opportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} partner={partner} />
        ))}
      </div>
    </section>
  )
}
