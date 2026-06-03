"use client"

import { cn } from "@/lib/utils"
import type { WorkspaceListItem } from "@/lib/hooks/use-workspaces"
import { MapPin, Building2 } from "lucide-react"

type Props = {
  workspaces: WorkspaceListItem[]
  selectedSlug: string | null
  onSelect: (slug: string) => void
  className?: string
}

export function WorkspacePicker({ workspaces, selectedSlug, onSelect, className }: Props) {
  if (workspaces.length === 0) return null

  return (
    <section
      className={cn("rounded-xl border border-border bg-card p-4 sm:p-5", className)}
      aria-label="Choose a workspace"
    >
      <div className="mb-3 flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Choose a workspace</h2>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        You have {workspaces.length} spaces available. Select one to continue booking.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {workspaces.map((w) => {
          const selected = selectedSlug === w.slug
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onSelect(w.slug)}
              className={cn(
                "flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors",
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              {w.coverImage ? (
                <img
                  src={w.coverImage}
                  alt=""
                  className="h-24 w-full rounded-md object-cover"
                />
              ) : (
                <div className="flex h-24 w-full items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                  No photo
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{w.name}</p>
                {w.location ? (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{w.location}</span>
                  </p>
                ) : null}
                {w.startingPrice > 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    From {w.currency} {w.startingPrice.toLocaleString()}
                  </p>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
