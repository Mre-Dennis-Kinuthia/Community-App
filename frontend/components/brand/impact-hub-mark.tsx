import { cn } from "@/lib/utils"

const BRAND_RED = "#A6192E"

type ImpactHubMarkProps = {
  size?: number
  className?: string
  /** Visually hidden label for screen readers when used without adjacent text */
  title?: string
}

/** Crisp vector square mark — scales cleanly on any screen density. */
export function ImpactHubMark({ size = 36, className, title = "Impact Hub" }: ImpactHubMarkProps) {
  return (
    <svg
      viewBox="0 0 151 151"
      width={size}
      height={size}
      className={cn("block shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="151" height="151" fill={BRAND_RED} />
      <text
        x="16"
        y="48"
        fill="#ffffff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="20"
        fontWeight="400"
        letterSpacing="0.02em"
      >
        IMPACT
      </text>
      <text
        x="16"
        y="112"
        fill="#ffffff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="48"
        fontWeight="700"
        letterSpacing="-0.02em"
      >
        HUB
      </text>
    </svg>
  )
}
