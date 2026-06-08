"use client"

import Link from "next/link"
import { BRAND_LOGO_PATH } from "@/lib/brand"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  variant?: "default" | "compact" | "landing" | "iconOnly"
  className?: string
}

const heights = {
  compact: 32,
  default: 40,
  landing: 48,
  iconOnly: 36,
} as const

export function Logo({ href, variant = "default", className }: LogoProps) {
  const height = heights[variant]
  const isIconOnly = variant === "iconOnly"

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={BRAND_LOGO_PATH}
      alt="Impact Hub Nairobi"
      width={isIconOnly ? height : Math.round(height * (334 / 151))}
      height={height}
      className={cn(
        "block shrink-0",
        isIconOnly ? "object-cover object-left" : "h-auto w-auto object-contain",
        className
      )}
      style={
        isIconOnly
          ? { width: height, height, maxWidth: height }
          : { height, width: "auto", maxHeight: height }
      }
    />
  )

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex rounded-md transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Impact Hub Nairobi home"
      >
        {image}
      </Link>
    )
  }

  return image
}
