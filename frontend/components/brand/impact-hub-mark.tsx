import { BRAND_APP_ICON_SVG_PATH, BRAND_MARK_PATH } from "@/lib/brand"
import { cn } from "@/lib/utils"

type ImpactHubMarkProps = {
  size?: number
  className?: string
  title?: string
}

/**
 * Official Impact Hub square mark (vector).
 * App-icon / favicon only — not used in platform headers.
 */
export function ImpactHubMark({ size = 36, className, title = "Impact Hub" }: ImpactHubMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BRAND_APP_ICON_SVG_PATH}
      alt={title}
      width={size}
      height={size}
      className={cn("block shrink-0 object-contain", className)}
      style={{ width: size, height: size, minWidth: size }}
      decoding="async"
      onError={(event) => {
        const img = event.currentTarget
        if (img.dataset.fallbackApplied === "true") return
        img.dataset.fallbackApplied = "true"
        img.src = BRAND_MARK_PATH
      }}
    />
  )
}
