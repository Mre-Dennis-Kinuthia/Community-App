"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { cn, getInitials } from "@/lib/utils"

type ExpertPhotoProps = {
  name: string
  photoUrl?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-14 w-14 md:h-16 md:w-16",
  lg: "h-20 w-20",
}

const fallbackText = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
}

export function ExpertPhoto({ name, photoUrl, size = "md", className }: ExpertPhotoProps) {
  const src = getImageDisplayUrl(photoUrl)
  const initials = getInitials(name)

  return (
    <Avatar className={cn("shrink-0 border border-border", sizeClasses[size], className)}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback className={cn("font-medium", fallbackText[size])}>{initials}</AvatarFallback>
    </Avatar>
  )
}
