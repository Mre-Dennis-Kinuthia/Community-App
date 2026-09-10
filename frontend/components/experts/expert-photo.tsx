"use client"

import { GraduationCap } from "lucide-react"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { cn } from "@/lib/utils"

type ExpertPhotoProps = {
  name: string
  photoUrl?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-24 w-24",
}

export function ExpertPhoto({ name, photoUrl, size = "md", className }: ExpertPhotoProps) {
  const src = getImageDisplayUrl(photoUrl)
  const sizeClass = sizeClasses[size]
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted",
        sizeClass,
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : initials ? (
        <span className="text-sm font-semibold text-muted-foreground">{initials}</span>
      ) : (
        <GraduationCap className="h-5 w-5 text-muted-foreground" aria-hidden />
      )}
      <span className="sr-only">{name}</span>
    </div>
  )
}
