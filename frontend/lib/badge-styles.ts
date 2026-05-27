/** Institutional badge palette — primary + neutral only (no rainbow chart-*). */

export const badgeNeutral =
  "bg-muted text-muted-foreground border border-border"

export const badgePrimary =
  "bg-primary/10 text-primary border border-primary/20"

export const badgeSuccess =
  "bg-muted text-foreground border border-border"

export const badgeWarning =
  "bg-muted text-foreground border border-border"

export const badgeDestructive =
  "bg-destructive/10 text-destructive border border-destructive/20"

/** Map arbitrary labels to one of a few calm styles (hash-stable). */
export function badgeClassForLabel(label: string): string {
  const bucket = label.length % 3
  if (bucket === 0) return badgeNeutral
  if (bucket === 1) return badgePrimary
  return badgeSuccess
}
