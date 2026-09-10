"use client"

import Link from "next/link"
import { CalendarDays, MapPin } from "lucide-react"
import { ExpertPhoto } from "@/components/experts/expert-photo"
import { expertPublicPath } from "@/lib/experts"
import { cn } from "@/lib/utils"
import type { Expert } from "@/types/expert"

type ExpertCardProps = {
  expert: Expert
}

export function ExpertCard({ expert }: ExpertCardProps) {
  const chips = expert.expertise.slice(0, 3)
  const extra = expert.expertise.length - chips.length
  const bio = expert.bio.trim()

  return (
    <Link
      href={expertPublicPath(expert)}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card",
        "transition-colors hover:border-primary/40 hover:bg-muted/20"
      )}
    >
      <div className="flex flex-1 flex-col items-center px-4 pb-4 pt-5 text-center">
        <ExpertPhoto name={expert.name} photoUrl={expert.photoUrl} size="md" />

        <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-1.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight group-hover:text-primary">
            {expert.name}
          </h3>
          {expert.isFeatured ? (
            <span className="text-[10px] font-medium uppercase tracking-wide text-primary">
              Featured
            </span>
          ) : null}
        </div>

        {expert.organization ? (
          <p className="mt-1 line-clamp-1 w-full text-xs text-muted-foreground">
            {expert.organization}
          </p>
        ) : null}

        {expert.title ? (
          <p className="line-clamp-1 w-full text-[11px] text-muted-foreground/80">
            {expert.title}
          </p>
        ) : null}

        {expert.industry ? (
          <p className="mt-1 line-clamp-1 w-full text-[11px] font-medium text-foreground/80">
            {expert.industry}
          </p>
        ) : null}

        {expert.location ? (
          <p className="mt-1 inline-flex max-w-full items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{expert.location}</span>
          </p>
        ) : null}

        {bio ? (
          <p className="mt-3 line-clamp-3 w-full text-left text-xs leading-relaxed text-muted-foreground">
            {bio}
          </p>
        ) : null}

        <div className="mt-auto flex w-full items-end justify-between gap-2 pt-3">
          {chips.length > 0 ? (
            <p className="min-w-0 truncate text-left text-[11px] text-muted-foreground/80">
              {chips.join(" · ")}
              {extra > 0 ? ` · +${extra}` : ""}
            </p>
          ) : (
            <span />
          )}
          {expert.eventsCount > 0 ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
              <CalendarDays className="h-3 w-3" />
              {expert.eventsCount}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
