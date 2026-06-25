import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { sanitizeOpportunityHtmlForMobile } from "@/lib/community-opportunity"

type OpportunityContentProps = {
  html: string
  className?: string
}

/** Renders admin-authored HTML constrained to the mobile viewport width. */
export function OpportunityContent({ html, className }: OpportunityContentProps) {
  const safeHtml = useMemo(() => sanitizeOpportunityHtmlForMobile(html), [html])

  return (
    <div
      className={cn("opportunity-content text-sm leading-relaxed text-foreground", className)}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
