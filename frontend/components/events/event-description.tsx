"use client"

import { useMemo } from "react"
import { prepareRichTextContent } from "@/lib/rich-text"
import { cn } from "@/lib/utils"

type EventDescriptionProps = {
  html: string | null | undefined
  className?: string
}

const descriptionStyles = cn(
  "event-description text-sm leading-relaxed text-foreground",
  "[&_a]:text-primary [&_a]:underline",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1",
  "[&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold",
  "[&_li]:ml-4 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_p+p]:mt-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3",
  "[&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
)

/** Renders admin event copy (HTML, markdown, or plain text). */
export function EventDescription({ html, className }: EventDescriptionProps) {
  const prepared = useMemo(() => prepareRichTextContent(html), [html])

  if (!prepared) return null

  return (
    <div
      className={cn(descriptionStyles, className)}
      dangerouslySetInnerHTML={{ __html: prepared }}
    />
  )
}

export { descriptionStyles as eventDescriptionStyles }
