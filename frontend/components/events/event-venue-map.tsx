"use client"

import { ExternalLink, MapPin } from "lucide-react"
import {
  getGoogleMapsEmbedUrl,
  getGoogleMapsOpenUrl,
  shouldShowEventVenueMap,
} from "@/lib/google-maps"
import { cn } from "@/lib/utils"

type EventVenueMapProps = {
  location?: string | null
  locationType?: string | null
  googleMapsUrl?: string | null
  className?: string
  /** Compact preview for admin forms */
  compact?: boolean
}

export function EventVenueMap({
  location,
  locationType,
  googleMapsUrl,
  className,
  compact = false,
}: EventVenueMapProps) {
  if (!shouldShowEventVenueMap({ location, locationType, googleMapsUrl })) {
    return null
  }

  const embedUrl = getGoogleMapsEmbedUrl({ location, googleMapsUrl })
  const openUrl = getGoogleMapsOpenUrl({ location, googleMapsUrl })
  if (!embedUrl || !openUrl) return null

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[#edeff2] bg-white shadow-sm",
        className
      )}
    >
      <div className={cn("relative w-full bg-[#edeff2]", compact ? "h-44" : "h-56 sm:h-64")}>
        <iframe
          title={`Map of ${location || "event venue"}`}
          src={embedUrl}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <div className="flex items-start justify-between gap-3 border-t border-[#edeff2] px-4 py-3">
        <div className="min-w-0 flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#812926]" aria-hidden />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#0a1f38]">
              {location?.trim() || "Event venue"}
            </p>
            <p className="text-xs text-[#1c395c]/70">Open in Google Maps for directions</p>
          </div>
        </div>
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#812926] hover:underline"
        >
          Open map
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
