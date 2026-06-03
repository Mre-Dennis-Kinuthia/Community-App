"use client"

import { Building2 } from "lucide-react"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { cn } from "@/lib/utils"

type PartnerLogoProps = {
  name: string
  logoUrl?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
}

export function PartnerLogo({ name, logoUrl, size = "md", className }: PartnerLogoProps) {
  const src = getImageDisplayUrl(logoUrl)
  const sizeClass = sizeClasses[size]

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted",
        sizeClass,
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="max-h-full max-w-full object-contain p-1.5" />
      ) : (
        <Building2 className="h-5 w-5 text-muted-foreground" aria-hidden />
      )}
      <span className="sr-only">{name}</span>
    </div>
  )
}
