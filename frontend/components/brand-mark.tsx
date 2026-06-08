import { BRAND_LOGO_PATH } from "@/lib/brand"
import { cn } from "@/lib/utils"

type BrandMarkProps = {
  size?: number
  className?: string
}

/** Square tile from the official Impact Hub Nairobi logo. */
export function BrandMark({ size = 36, className }: BrandMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BRAND_LOGO_PATH}
      alt=""
      width={size}
      height={size}
      aria-hidden
      className={cn("shrink-0 object-cover object-left", className)}
      style={{ width: size, height: size, maxWidth: size }}
    />
  )
}
