"use client"

import Link from "next/link"
import { BrandMark } from "@/components/brand-mark"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  variant?: "default" | "compact" | "landing" | "iconOnly"
  className?: string
}

const markSizes = {
  compact: 32,
  default: 36,
  landing: 44,
  iconOnly: 36,
} as const

export function Logo({ href, variant = "default", className }: LogoProps) {
  const markSize = markSizes[variant]

  const wordmark =
    variant !== "iconOnly" ? (
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-bold tracking-tight text-foreground",
            variant === "compact" && "text-sm",
            variant === "default" && "text-base",
            variant === "landing" && "text-lg md:text-xl"
          )}
        >
          Impact Hub
        </span>
        <span
          className={cn(
            "font-semibold uppercase tracking-[0.18em] text-primary",
            variant === "compact" ? "mt-0.5 text-[9px]" : "mt-1 text-[10px]",
            variant === "landing" && "text-[11px] md:text-xs"
          )}
        >
          Nairobi
        </span>
      </span>
    ) : null

  const content = (
    <span className={cn("inline-flex min-w-0 items-center gap-3", className)}>
      <BrandMark size={markSize} />
      {wordmark}
    </span>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="rounded-md transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Impact Hub Nairobi home"
      >
        {content}
      </Link>
    )
  }

  return content
}
