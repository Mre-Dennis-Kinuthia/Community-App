"use client"

import Link from "next/link"
import { Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

const BRAND_NAME = "Impact Hub Nairobi"

interface LogoProps {
  /** When provided, the logo wraps in a Link to this href */
  href?: string
  /** Visual variant: default (icon + text), compact (smaller), iconOnly (icon box only) */
  variant?: "default" | "compact" | "iconOnly"
  className?: string
}

export function Logo({ href, variant = "default", className }: LogoProps) {
  const iconBox = (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm",
        variant === "compact" ? "h-8 w-8" : "h-9 w-9"
      )}
    >
      <Building2 className={variant === "compact" ? "h-4 w-4" : "h-4 w-4"} />
    </div>
  )

  const text = variant !== "iconOnly" && (
    <span
      className={cn(
        "font-semibold tracking-tight text-primary",
        variant === "compact" ? "text-xs" : "text-sm"
      )}
    >
      {BRAND_NAME}
    </span>
  )

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {iconBox}
      {text}
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="transition-opacity duration-200 ease-out hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md">
        {content}
      </Link>
    )
  }

  return content
}
