"use client"

import { ExternalLink } from "lucide-react"
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
    <div className={cn("relative max-w-lg overflow-hidden rounded-2xl bg-[#edeff2]", className)}>
      <div className={cn("relative w-full", compact ? "h-40" : "h-48 sm:h-52")}>
        <iframe
          title={`Map of ${location || "event venue"}`}
          src={embedUrl}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#0a1f38] shadow-sm"
        >
          Maps
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
