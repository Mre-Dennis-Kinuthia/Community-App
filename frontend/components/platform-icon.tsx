import Image from "next/image"
import { cn } from "@/lib/utils"
import { resolveEventPlatform } from "@/lib/event-platform"

interface PlatformIconProps {
  src: string
  alt: string
  size?: number
  className?: string
}

export function PlatformIcon({ src, alt, size = 20, className }: PlatformIconProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      unoptimized
    />
  )
}

interface EventPlatformBadgeProps {
  icon: string
  label: string
  size?: number
  className?: string
}

export function EventPlatformBadge({ icon, label, size = 18, className }: EventPlatformBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 min-w-0", className)}>
      <PlatformIcon src={icon} alt="" size={size} />
      {label ? <span className="truncate">{label}</span> : null}
    </span>
  )
}

interface EventPlatformPreviewProps {
  locationType?: string | null
  onlineUrl?: string | null
  location?: string | null
  className?: string
}

/** Live preview of detected format / meeting provider while editing an event. */
export function EventPlatformPreview({
  locationType,
  onlineUrl,
  location,
  className,
}: EventPlatformPreviewProps) {
  const info = resolveEventPlatform({ locationType, onlineUrl, location })
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground",
        className
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wide shrink-0">Shows as</span>
      <EventPlatformBadge icon={info.icon} label={info.label} size={20} />
    </div>
  )
}
