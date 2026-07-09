import { BRAND_MARK_PATH, getBrandMarkDimensions } from "@/lib/brand"
import { cn } from "@/lib/utils"

type BrandMarkProps = {
  size?: number
  className?: string
}

/** Square Impact Hub mark from the official logo (home-screen / favicon tile). */
export function BrandMark({ size = 36, className }: BrandMarkProps) {
  const { width, height } = getBrandMarkDimensions(size)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BRAND_MARK_PATH}
      alt=""
      width={width}
      height={height}
      aria-hidden
      className={cn("shrink-0 object-contain", className)}
      style={{ width, height, minWidth: width }}
    />
  )
}
