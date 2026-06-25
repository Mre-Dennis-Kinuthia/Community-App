import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getImageDisplayUrl } from "@/lib/stored-image"
import {
  OPPORTUNITY_STATUS_LABELS,
  opportunityCardText,
  type OpportunityPreviewItem,
  type OpportunityStatus,
} from "@/lib/community-opportunity"
import { cn } from "@/lib/utils"

const opportunityStatusColors: Record<string, string> = {
  open: "bg-primary/10 text-primary border-primary/20",
  closed: "bg-muted text-muted-foreground border border-border",
}

const MAX_TAGS = 3
const TITLE_MAX = 90
const SUMMARY_MAX = 160
const SOURCE_MAX = 48
const TAG_MAX = 24

type OpportunityPreviewCardProps = {
  item: OpportunityPreviewItem
  className?: string
}

export function OpportunityPreviewCard({ item, className }: OpportunityPreviewCardProps) {
  const flier = item.flierUrl ? getImageDisplayUrl(item.flierUrl) : undefined
  const statusLabel =
    OPPORTUNITY_STATUS_LABELS[item.status as OpportunityStatus] ?? item.status
  const title = opportunityCardText(item.title, TITLE_MAX) ?? "Untitled opportunity"
  const summary = opportunityCardText(item.summary, SUMMARY_MAX)
  const source = opportunityCardText(item.source, SOURCE_MAX)
  const tags = (item.tags ?? []).slice(0, MAX_TAGS)
  const extraTags = Math.max(0, (item.tags ?? []).length - MAX_TAGS)

  return (
    <Card
      className={cn(
        "flex h-full min-h-[280px] flex-col overflow-hidden border-border transition-all hover:border-primary/30 hover:bg-muted/20",
        className
      )}
    >
      {flier ? (
        <div className="aspect-[16/9] w-full shrink-0 overflow-hidden border-b border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flier} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      ) : null}

      <CardHeader className="min-w-0 space-y-2 pb-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {item.featured ? (
            <Badge className="shrink-0 bg-primary/10 text-primary border-primary/20">Featured</Badge>
          ) : null}
          <Badge className={cn("shrink-0", opportunityStatusColors[item.status] ?? "")}>
            {statusLabel}
          </Badge>
          {source ? (
            <Badge variant="secondary" className="max-w-full truncate text-xs font-normal">
              {source}
            </Badge>
          ) : null}
        </div>

        <CardTitle className="line-clamp-2 break-words text-base leading-snug md:text-lg">
          {title}
        </CardTitle>

        {summary ? (
          <CardDescription className="line-clamp-2 text-sm leading-relaxed">
            {summary}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="mt-auto flex min-w-0 flex-1 flex-col gap-3 pt-0">
        {tags.length > 0 ? (
          <div className="flex min-w-0 flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="max-w-[9rem] truncate text-xs font-normal"
                title={tag}
              >
                {opportunityCardText(tag, TAG_MAX) ?? tag}
              </Badge>
            ))}
            {extraTags > 0 ? (
              <Badge variant="outline" className="text-xs font-normal">
                +{extraTags}
              </Badge>
            ) : null}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {item.deadline ? (
          <p className="truncate text-xs text-muted-foreground">
            Apply by {format(new Date(item.deadline), "MMM d, yyyy")}
          </p>
        ) : null}

        <Badge
          variant={item.status === "open" ? "default" : "secondary"}
          className="w-full justify-center py-2 text-center text-xs font-medium"
        >
          {item.status === "open" ? "View & apply →" : "View details →"}
        </Badge>
      </CardContent>
    </Card>
  )
}
