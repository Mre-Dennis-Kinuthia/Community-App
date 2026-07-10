/**
 * Google Maps helpers for in-person / hybrid event venues.
 * Embed works from a venue address (no API key) or an optional Maps share URL.
 */

export function isValidGoogleMapsUrl(url: string): boolean {
  if (!url.trim()) return true
  try {
    const parsed = new URL(url.trim())
    if (!["http:", "https:"].includes(parsed.protocol)) return false
    return /google\.(com|[a-z]{2,3})(\.[a-z]{2})?\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\./i.test(
      parsed.href
    )
  } catch {
    return false
  }
}

function embedFromQuery(query: string, zoom = 15): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`
}

/** iframe src for a venue map pin (Luma-style preview). */
export function getGoogleMapsEmbedUrl(options: {
  location?: string | null
  googleMapsUrl?: string | null
}): string | null {
  const mapsUrl = options.googleMapsUrl?.trim()
  if (mapsUrl && isValidGoogleMapsUrl(mapsUrl)) {
    try {
      const u = new URL(mapsUrl)
      if (u.pathname.includes("/maps/embed") || u.searchParams.has("pb")) {
        return mapsUrl
      }
      const q = u.searchParams.get("q")
      if (q) return embedFromQuery(q)

      const placeMatch = u.pathname.match(/\/maps\/place\/([^/]+)/)
      if (placeMatch?.[1]) {
        return embedFromQuery(decodeURIComponent(placeMatch[1].replace(/\+/g, " ")))
      }

      const coordsMatch = u.pathname.match(/\/maps\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
      if (coordsMatch) {
        return embedFromQuery(`${coordsMatch[1]},${coordsMatch[2]}`)
      }

      // Short links / other Maps URLs — Maps still resolves many of these as queries
      return embedFromQuery(mapsUrl)
    } catch {
      // fall through to location text
    }
  }

  const location = options.location?.trim()
  if (!location) return null
  // Don't try to embed a meeting URL as a map
  if (/^https?:\/\//i.test(location)) {
    if (isValidGoogleMapsUrl(location)) {
      return getGoogleMapsEmbedUrl({ googleMapsUrl: location, location: null })
    }
    return null
  }
  return embedFromQuery(location)
}

/** Opens Google Maps in a new tab (directions / place). */
export function getGoogleMapsOpenUrl(options: {
  location?: string | null
  googleMapsUrl?: string | null
}): string | null {
  const mapsUrl = options.googleMapsUrl?.trim()
  if (mapsUrl && isValidGoogleMapsUrl(mapsUrl)) return mapsUrl

  const location = options.location?.trim()
  if (!location) return null
  if (/^https?:\/\//i.test(location)) {
    return isValidGoogleMapsUrl(location) ? location : null
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}

export function shouldShowEventVenueMap(options: {
  locationType?: string | null
  location?: string | null
  googleMapsUrl?: string | null
}): boolean {
  const type = options.locationType || "in-person"
  if (type === "online") return false
  return Boolean(getGoogleMapsEmbedUrl(options))
}
