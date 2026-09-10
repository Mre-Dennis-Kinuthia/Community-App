"use client"

import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExpertPhoto } from "@/components/experts/expert-photo"
import { expertPublicPath } from "@/lib/experts"
import type { Expert } from "@/types/expert"

type ExpertCardProps = {
  expert: Expert
}

export function ExpertCard({ expert }: ExpertCardProps) {
  return (
    <Link href={expertPublicPath(expert)} className="group block h-full">
      <Card className="h-full border-border transition-colors hover:border-primary/40 hover:bg-muted/20">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-start gap-4">
            <ExpertPhoto name={expert.name} photoUrl={expert.photoUrl} size="md" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {expert.isFeatured ? <Badge className="text-xs">Featured</Badge> : null}
                {expert.organization ? (
                  <Badge variant="outline" className="text-xs font-normal">
                    {expert.organization}
                  </Badge>
                ) : null}
              </div>
              <h3 className="text-lg font-semibold leading-snug group-hover:text-primary">
                {expert.name}
              </h3>
              <p className="text-sm text-muted-foreground">{expert.title}</p>
            </div>
          </div>

          {expert.bio ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{expert.bio}</p>
          ) : null}

          <div className="mt-auto space-y-3">
            {expert.expertise.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {expert.expertise.slice(0, 3).map((area) => (
                  <Badge key={area} variant="outline" className="text-xs font-normal">
                    {area}
                  </Badge>
                ))}
                {expert.expertise.length > 3 ? (
                  <Badge variant="outline" className="text-xs font-normal">
                    +{expert.expertise.length - 3}
                  </Badge>
                ) : null}
              </div>
            ) : null}

            {expert.eventsCount > 0 ? (
              <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                {expert.eventsCount} upcoming {expert.eventsCount === 1 ? "session" : "sessions"}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
