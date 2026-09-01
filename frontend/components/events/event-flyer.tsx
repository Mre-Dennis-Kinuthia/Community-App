/* eslint-disable @next/next/no-img-element */
import { getImageDisplayUrl } from "@/lib/stored-image"
import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"

type EventFlyerProps = {
  src: string | null | undefined
  alt?: string
  className?: string
  /** Compact listing vs full poster on the event page. */
  variant?: "card" | "detail" | "thumb"
}

/** Event cover — full poster on detail, 16:10 crop on cards. */
export function EventFlyer({
  src,
  alt = "",
  className,
  variant = "detail",
}: EventFlyerProps) {
  const imageSrc = getImageDisplayUrl(src || undefined)

  if (!imageSrc) {
    if (variant === "card" || variant === "thumb") {
      return (
        <div
          className={cn(
            "flex items-center justify-center bg-[#f3f1ec]",
            variant === "thumb" ? "h-full min-h-[5.5rem] w-full" : "aspect-[16/10] w-full",
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
      <div className={cn("h-full min-h-[5.5rem] w-full overflow-hidden bg-muted", className)}>
        <img
          src={imageSrc}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-hidden bg-muted",
        variant === "detail"
          ? "mx-auto flex max-w-2xl justify-center rounded-lg border border-border bg-muted/30 p-2 sm:p-3"
          : "",
        className
      )}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={
          variant === "detail"
            ? "block h-auto max-h-[min(22rem,42vh)] w-auto max-w-full rounded-md object-contain"
            : "aspect-[16/10] w-full object-cover"
        }
        loading={variant === "card" ? "lazy" : "eager"}
      />
    </div>
  )
}
