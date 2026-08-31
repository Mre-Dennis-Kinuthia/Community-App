/* eslint-disable @next/next/no-img-element */
import { getImageDisplayUrl } from "@/lib/stored-image"
import { cn } from "@/lib/utils"

type EventFlyerProps = {
  src: string | null | undefined
  alt?: string
  className?: string
  /** Compact listing vs full poster on the event page. */
  variant?: "card" | "detail"
}

/** Full poster, never cropped — same treatment as opportunity fliers. */
export function EventFlyer({
  src,
  alt = "",
  className,
  variant = "detail",
}: EventFlyerProps) {
  const imageSrc = getImageDisplayUrl(src || undefined)
  if (!imageSrc) return null

  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-hidden border-border bg-muted",
        variant === "detail"
          ? "rounded-lg border"
          : "rounded-none border-b",
        className
      )}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={
          variant === "detail"
            ? "block h-auto w-full max-w-full object-contain"
            : "max-h-48 w-full object-contain sm:max-h-56"
        }
        loading={variant === "card" ? "lazy" : "eager"}
      />
    </div>
  )
}
