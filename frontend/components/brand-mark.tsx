import { ImpactHubMark } from "@/components/brand/impact-hub-mark"
import { cn } from "@/lib/utils"

type BrandMarkProps = {
  size?: number
  className?: string
}

/** Decorative square mark (parent provides accessible name). */
export function BrandMark({ size = 36, className }: BrandMarkProps) {
  return (
    <span aria-hidden className={cn("inline-flex shrink-0", className)}>
      <ImpactHubMark size={size} title="Impact Hub" />
    </span>
  )
}
