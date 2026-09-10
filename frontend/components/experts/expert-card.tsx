"use client"

import Link from "next/link"
import { CalendarDays } from "lucide-react"
import { ExpertPhoto } from "@/components/experts/expert-photo"
import { expertPublicPath } from "@/lib/experts"
import { cn } from "@/lib/utils"
import type { Expert } from "@/types/expert"

type ExpertCardProps = {
  expert: Expert
}

export function ExpertCard({ expert }: ExpertCardProps) {
  const subtitle = [expert.title, expert.organization].filter(Boolean).join(" · ")
  const chips = expert.expertise.slice(0, 2)
  const extra = expert.expertise.length - chips.length

  return (
    <Link
      href={expertPublicPath(expert)}
      className={cn(
        "group flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5",
        "transition-colors hover:border-primary/40 hover:bg-muted/20"
      )}
    >
      <ExpertPhoto name={expert.name} photoUrl={expert.photoUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold leading-tight group-hover:text-primary">
            {expert.name}
          </h3>
          {expert.isFeatured ? (
            <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-primary">
              Featured
            </span>
          ) : null}
        </div>
        {subtitle ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
        {chips.length > 0 ? (
          <p className="mt-1 truncate text-[11px] text-muted-foreground/80">
            {chips.join(" · ")}
            {extra > 0 ? ` · +${extra}` : ""}
          </p>
        ) : null}
      </div>
      {expert.eventsCount > 0 ? (
        <span className="hidden shrink-0 items-center gap-1 text-[11px] text-muted-foreground sm:inline-flex">
          <CalendarDays className="h-3 w-3" />
          {expert.eventsCount}
        </span>
      ) : null}
    </Link>
  )
}
