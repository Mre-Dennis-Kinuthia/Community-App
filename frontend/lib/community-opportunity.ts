/** Scouted community opportunities — shared constants */

export const OPPORTUNITY_STATUSES = ["draft", "open", "closed", "archived"] as const
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number]

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
  archived: "Archived",
}

/** Suggested tags for filtering (admins can add custom tags too) */
export const OPPORTUNITY_TAG_SUGGESTIONS = [
  "Funding",
  "Grant",
  "Fellowship",
  "Accelerator",
  "Incubator",
  "Competition",
  "Training",
  "Mentorship",
  "Job",
  "Internship",
  "Event",
  "Partnership",
  "Climate",
  "Health",
  "Education",
  "AgriTech",
] as const

export type CommunityOpportunityRecord = {
  id: string
  title: string
  summary: string | null
  content: string
  flierUrl: string | null
  applyUrl: string
  tags: string[]
  source: string | null
  status: string
  featured: boolean
  deadline: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export function normalizeOpportunityTags(tags: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of tags) {
    const t = raw.trim()
    if (!t) continue
    const key = t.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(t)
  }
  return out
}

export function opportunityIsVisible(status: string): boolean {
  return status === "open" || status === "closed"
}

export function opportunityApplyEnabled(status: string, deadline: Date | null): boolean {
  if (status !== "open") return false
  if (!deadline) return true
  return deadline.getTime() >= Date.now()
}

/** Strip HTML and clamp text for compact card previews. */
export function opportunityCardText(
  value: string | null | undefined,
  maxLength: number
): string | null {
  const plain = (value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!plain) return null
  if (plain.length <= maxLength) return plain
  return `${plain.slice(0, maxLength - 1).trimEnd()}…`
}

export type OpportunityPreviewItem = Pick<
  CommunityOpportunityRecord,
  "id" | "title" | "summary" | "flierUrl" | "status" | "featured" | "source" | "tags" | "deadline"
>
