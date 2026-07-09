import { BRAND_MARK_PATH } from "@/lib/brand"
import { cn } from "@/lib/utils"

type ImpactHubMarkProps = {
  size?: number
  className?: string
  /** Visually hidden label for screen readers when used without adjacent text */
  title?: string
}

/**
 * Square app-icon mark cropped from the official logo.
 * Use only for favicon / PWA / install prompts — not in platform headers.
 */
export function ImpactHubMark({ size = 36, className, title = "Impact Hub" }: ImpactHubMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BRAND_MARK_PATH}
      alt={title}
      width={size}
      height={size}
      className={cn("block shrink-0 object-contain", className)}
      style={{ width: size, height: size, minWidth: size }}
      decoding="async"
    />
  )
}
