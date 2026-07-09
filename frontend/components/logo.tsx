"use client"

import Link from "next/link"
import { ImpactHubMark } from "@/components/brand/impact-hub-mark"
import { BRAND_LOGO_PATH, getBrandLogoDimensions } from "@/lib/brand"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  /**
   * Full horizontal Impact Hub Nairobi logo (default).
   * Use `mark` only for app-icon contexts (PWA install prompt, favicon slots).
   */
  variant?: "default" | "compact" | "landing" | "mark"
  className?: string
}

const heights = {
  compact: 30,
  default: 40,
  landing: 48,
  mark: 32,
} as const

function FullLogoImage({
  height,
  className,
}: {
  height: number
  className?: string
}) {
  const { width } = getBrandLogoDimensions(height)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BRAND_LOGO_PATH}
      alt="Impact Hub Nairobi"
      width={width}
      height={height}
      className={cn("block shrink-0 object-contain", className)}
      style={{ width, height, minWidth: width }}
      decoding="async"
    />
  )
}

export function Logo({ href, variant = "default", className }: LogoProps) {
  const isMark = variant === "mark"
  const height = heights[isMark ? "mark" : variant]

  const content = isMark ? (
    <ImpactHubMark size={height} className={className} />
  ) : (
    <FullLogoImage height={height} className={className} />
  )

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex max-w-none items-center rounded-md transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Impact Hub Nairobi home"
      >
        {content}
      </Link>
    )
  }

  return <span className="inline-flex items-center">{content}</span>
}
