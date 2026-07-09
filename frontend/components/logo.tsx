"use client"

import Link from "next/link"
import {
  BRAND_LOGO_PATH,
  BRAND_MARK_PATH,
  getBrandLogoDimensions,
  getBrandMarkDimensions,
} from "@/lib/brand"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  /** Full horizontal logo (default). Use `mark` only for square app-icon slots. */
  variant?: "default" | "compact" | "landing" | "mark"
  className?: string
}

const heights = {
  compact: 32,
  default: 40,
  landing: 48,
  mark: 36,
} as const

export function Logo({ href, variant = "default", className }: LogoProps) {
  const isMark = variant === "mark"
  const height = heights[isMark ? "mark" : variant]
  const { width } = isMark ? getBrandMarkDimensions(height) : getBrandLogoDimensions(height)

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={isMark ? BRAND_MARK_PATH : BRAND_LOGO_PATH}
      alt={isMark ? "Impact Hub" : "Impact Hub Nairobi"}
      width={width}
      height={height}
      className={cn("block shrink-0 object-contain", className)}
      style={{
        width,
        height,
        minWidth: width,
        maxWidth: "none",
      }}
    />
  )

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex max-w-none rounded-md transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Impact Hub Nairobi home"
      >
        {image}
      </Link>
    )
  }

  return image
}
