import { useMemo } from "react"
import { OpportunityContent } from "@/components/opportunities/opportunity-content"
import { prepareRichTextContent } from "@/lib/rich-text"
import { cn } from "@/lib/utils"

type EventDescriptionProps = {
  html: string | null | undefined
  className?: string
}

/** Renders admin event copy (HTML, markdown, or plain text). */
export function EventDescription({ html, className }: EventDescriptionProps) {
  const prepared = useMemo(() => prepareRichTextContent(html), [html])

  if (!prepared) return null

  return (
    <OpportunityContent html={prepared} className={cn("event-description", className)} />
  )
}
