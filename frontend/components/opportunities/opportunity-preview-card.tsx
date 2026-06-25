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
const SUMMARY_MAX = 140
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
        "flex h-full min-h-0 w-full min-w-0 max-w-full flex-col overflow-hidden border-border transition-colors",
        "active:bg-muted/30 md:min-h-[260px] md:hover:border-primary/30 md:hover:bg-muted/20",
        className
      )}
    >
      {flier ? (
        <div className="flex w-full min-w-0 shrink-0 items-center justify-center overflow-hidden border-b border-border bg-muted sm:aspect-[16/9] sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={flier}
            alt=""
            className="max-h-40 w-full object-contain sm:h-full sm:max-h-none sm:object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <CardHeader className="min-w-0 space-y-2 px-3 pb-2 pt-3 sm:px-4 sm:pt-4">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {item.featured ? (
            <Badge className="shrink-0 bg-primary/10 text-primary border-primary/20 text-[10px] sm:text-xs">
              Featured
            </Badge>
          ) : null}
          <Badge
            className={cn(
              "shrink-0 text-[10px] sm:text-xs",
              opportunityStatusColors[item.status] ?? ""
            )}
          >
            {statusLabel}
          </Badge>
          {source ? (
            <Badge
              variant="secondary"
              className="hidden min-w-0 max-w-full truncate text-[10px] font-normal sm:inline-flex sm:text-xs"
            >
              {source}
            </Badge>
          ) : null}
        </div>

        <CardTitle className="line-clamp-3 break-words text-sm leading-snug sm:line-clamp-2 sm:text-base md:text-lg">
          {title}
        </CardTitle>

        {source ? (
          <p className="truncate text-[11px] text-muted-foreground sm:hidden">{source}</p>
        ) : null}

        {summary ? (
          <CardDescription className="line-clamp-2 text-xs leading-relaxed sm:text-sm">
            {summary}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="mt-auto flex min-w-0 flex-1 flex-col gap-2.5 px-3 pb-3 pt-0 sm:gap-3 sm:px-4 sm:pb-4">
        {tags.length > 0 ? (
          <div className="flex min-w-0 flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="max-w-[7.5rem] truncate text-[10px] font-normal sm:max-w-[9rem] sm:text-xs"
                title={tag}
              >
                {opportunityCardText(tag, TAG_MAX) ?? tag}
              </Badge>
            ))}
            {extraTags > 0 ? (
              <Badge variant="outline" className="text-[10px] font-normal sm:text-xs">
                +{extraTags}
              </Badge>
            ) : null}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {item.deadline ? (
          <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
            Apply by {format(new Date(item.deadline), "MMM d, yyyy")}
          </p>
        ) : null}

        <Badge
          variant={item.status === "open" ? "default" : "secondary"}
          className="w-full justify-center py-2.5 text-center text-[11px] font-medium sm:py-2 sm:text-xs"
        >
          {item.status === "open" ? "View & apply →" : "View details →"}
        </Badge>
      </CardContent>
    </Card>
  )
}
