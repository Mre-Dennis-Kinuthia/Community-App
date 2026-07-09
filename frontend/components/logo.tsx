"use client"

import Link from "next/link"
import { ImpactHubMark } from "@/components/brand/impact-hub-mark"
import {
  BRAND_LOGO_PATH,
  getBrandLogoDimensions,
  getBrandMarkDimensions,
} from "@/lib/brand"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  /** Full horizontal logo (default). Use `mark` for the square tile only. */
  variant?: "default" | "compact" | "landing" | "mark"
  /** Square mark on phone, full logo from `md` up */
  responsive?: boolean
  className?: string
}

const heights = {
  compact: 32,
  default: 40,
  landing: 48,
  mark: 36,
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

function MarkLogo({ height, className }: { height: number; className?: string }) {
  const { width } = getBrandMarkDimensions(height)
  return <ImpactHubMark size={width} className={className} />
}

export function Logo({ href, variant = "default", responsive = false, className }: LogoProps) {
  const isMark = variant === "mark"
  const height = heights[isMark ? "mark" : variant]

  const content = responsive ? (
    <>
      <MarkLogo height={heights.compact} className={cn("md:hidden", className)} />
      <FullLogoImage height={heights.default} className={cn("hidden md:block", className)} />
    </>
  ) : isMark ? (
    <MarkLogo height={height} className={className} />
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
