import { useMemo } from "react"
import { OpportunityContent } from "@/components/opportunities/opportunity-content"
import { cn } from "@/lib/utils"

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function plainTextToHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("")
}

type EventDescriptionProps = {
  html: string | null | undefined
  className?: string
}

/** Renders admin event copy the same way opportunity fliers render body HTML. */
export function EventDescription({ html, className }: EventDescriptionProps) {
  const prepared = useMemo(() => {
    const raw = (html || "").trim()
    if (!raw) return ""
    return looksLikeHtml(raw) ? raw : plainTextToHtml(raw)
  }, [html])

  if (!prepared) return null

  return (
    <OpportunityContent html={prepared} className={cn("event-description", className)} />
  )
}
