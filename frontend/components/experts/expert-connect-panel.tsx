"use client"

import { CalendarDays, ExternalLink, Linkedin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExpertMeetingForm } from "@/components/experts/expert-meeting-form"
import type { Expert } from "@/types/expert"

type ExpertConnectPanelProps = {
  expert: Expert
}

export function ExpertConnectPanel({ expert }: ExpertConnectPanelProps) {
  return (
    <div className="space-y-4 lg:sticky lg:top-6">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Request a clinic or services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {expert.bookingUrl ? (
            <Button className="w-full" asChild>
              <a href={expert.bookingUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open calendar
              </a>
            </Button>
          ) : null}
          {expert.linkedInUrl ? (
            <Button variant="outline" className="w-full" asChild>
              <a href={expert.linkedInUrl} target="_blank" rel="noopener noreferrer">
                <Linkedin className="mr-2 h-4 w-4" />
                LinkedIn
              </a>
            </Button>
          ) : null}
          <ExpertMeetingForm expertId={expert.slug || expert.id} expertName={expert.name} />
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">At a glance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-1.5">
            {expert.isFeatured ? <Badge>Featured</Badge> : null}
            {expert.organization ? (
              <Badge variant="outline">{expert.organization}</Badge>
            ) : null}
          </div>
          {expert.eventsCount > 0 ? (
            <div>
              <p className="text-muted-foreground">Upcoming sessions</p>
              <p className="inline-flex items-center gap-1.5 font-medium">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                {expert.eventsCount}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
