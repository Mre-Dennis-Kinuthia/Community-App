import { cn } from "@/lib/utils"

type OpportunityContentProps = {
  html: string
  className?: string
}

/** Renders admin-authored HTML with mobile-safe overflow and image sizing. */
export function OpportunityContent({ html, className }: OpportunityContentProps) {
  return (
    <div
      className={cn(
        "opportunity-content prose prose-sm max-w-none break-words dark:prose-invert",
        "prose-headings:break-words prose-p:break-words prose-li:break-words",
        "prose-a:break-words prose-a:text-primary prose-a:underline-offset-2",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
