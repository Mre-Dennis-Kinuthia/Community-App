/* eslint-disable @next/next/no-img-element */
import { getImageDisplayUrl } from "@/lib/stored-image"
import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"

type EventFlyerProps = {
  src: string | null | undefined
  alt?: string
  className?: string
  /** Compact listing vs square poster on the event page. */
  variant?: "card" | "detail" | "thumb"
}

/** Event cover — square poster on detail, 16:10 crop on cards. */
export function EventFlyer({
  src,
  alt = "",
  className,
  variant = "detail",
}: EventFlyerProps) {
  const imageSrc = getImageDisplayUrl(src || undefined)

  if (!imageSrc) {
    if (variant === "detail") {
      return (
        <div
          className={cn(
            "flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-[#f3f1ec]",
            className
          )}
          aria-hidden
        >
          <Calendar className="h-12 w-12 text-[#812926]/30" />
        </div>
      )
    }
    if (variant === "card" || variant === "thumb") {
      return (
        <div
          className={cn(
            "flex items-center justify-center bg-[#f3f1ec]",
            variant === "thumb" ? "h-full min-h-0 w-full" : "aspect-[16/10] w-full",
            className
          )}
          aria-hidden
        >
          <Calendar
            className={cn(
              "text-[#812926]/35",
              variant === "thumb" ? "h-6 w-6" : "h-10 w-10"
            )}
          />
        </div>
      )
    }
    return null
  }

  if (variant === "thumb") {
    return (
      <div className={cn("h-full min-h-0 w-full overflow-hidden bg-muted", className)}>
        <img
          src={imageSrc}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  if (variant === "detail") {
    return (
      <div
        className={cn(
          "aspect-square w-full overflow-hidden rounded-2xl bg-[#f3f1ec] shadow-sm",
          className
        )}
      >
        <img
          src={imageSrc}
          alt={alt}
          className="h-full w-full object-cover"
          loading="eager"
        />
      </div>
    )
  }

  return (
    <div className={cn("w-full min-w-0 overflow-hidden bg-muted", className)}>
      <img
        src={imageSrc}
        alt={alt}
        className="aspect-[16/10] w-full object-cover"
        loading="lazy"
      />
    </div>
  )
}
