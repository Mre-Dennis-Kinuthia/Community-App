/**
 * Event format (in-person / online / hybrid) and meeting provider icons.
 */

export type EventPlatformId =
  | "in-person"
  | "online"
  | "hybrid"
  | "zoom"
  | "google-meet"
  | "microsoft-teams"
  | "webex"

export type SharePlatformId =
  | "whatsapp"
  | "twitter"
  | "linkedin"
  | "facebook"

export interface PlatformMeta {
  id: EventPlatformId | SharePlatformId
  label: string
  icon: string
}

const ICON_BASE = "/platforms"

export const EVENT_PLATFORM_META: Record<EventPlatformId, PlatformMeta> = {
  "in-person": { id: "in-person", label: "In-person", icon: `${ICON_BASE}/in-person.svg` },
  online: { id: "online", label: "Online", icon: `${ICON_BASE}/online.svg` },
  hybrid: { id: "hybrid", label: "Hybrid", icon: `${ICON_BASE}/hybrid.svg` },
  zoom: { id: "zoom", label: "Zoom", icon: `${ICON_BASE}/zoom.svg` },
  "google-meet": { id: "google-meet", label: "Google Meet", icon: `${ICON_BASE}/google-meet.svg` },
  "microsoft-teams": {
    id: "microsoft-teams",
    label: "Microsoft Teams",
    icon: `${ICON_BASE}/microsoft-teams.svg`,
  },
  webex: { id: "webex", label: "Webex", icon: `${ICON_BASE}/webex.svg` },
}

export const SHARE_PLATFORM_META: Record<SharePlatformId, PlatformMeta> = {
  whatsapp: { id: "whatsapp", label: "WhatsApp", icon: `${ICON_BASE}/whatsapp.svg` },
  twitter: { id: "twitter", label: "X", icon: `${ICON_BASE}/x.svg` },
  linkedin: { id: "linkedin", label: "LinkedIn", icon: `${ICON_BASE}/linkedin.svg` },
  facebook: { id: "facebook", label: "Facebook", icon: `${ICON_BASE}/facebook.svg` },
}

export function detectMeetingPlatform(url?: string | null): EventPlatformId | null {
  if (!url?.trim()) return null
  const u = url.toLowerCase()
  if (u.includes("zoom.us") || u.includes("zoom.com")) return "zoom"
  if (u.includes("meet.google") || u.includes("google.com/meet") || u.includes("g.co/meet"))
    return "google-meet"
  if (
    u.includes("teams.microsoft") ||
    u.includes("teams.live.com") ||
    u.includes("office.com/meet") ||
    u.includes("msteams.link")
  )
    return "microsoft-teams"
  if (u.includes("webex.com") || u.includes("webex.us")) return "webex"
  return null
}

function formatLabel(locationType?: string | null): string {
  switch (locationType) {
    case "online":
      return "Online"
    case "hybrid":
      return "Hybrid"
    case "in-person":
    default:
      return "In-person"
  }
}

export interface ResolvedEventPlatform {
  id: EventPlatformId
  label: string
  icon: string
  /** Secondary format label when a meeting provider is detected on hybrid/online */
  formatLabel?: string
}

export function resolveEventPlatform(event: {
  locationType?: string | null
  onlineUrl?: string | null
  location?: string | null
}): ResolvedEventPlatform {
  const locationType = event.locationType || "in-person"
  const format = formatLabel(locationType)
  const meetingUrl =
    event.onlineUrl?.trim() ||
    (locationType === "online" && event.location?.includes("http") ? event.location : null)
  const meeting = detectMeetingPlatform(meetingUrl)

  if (meeting) {
    const meta = EVENT_PLATFORM_META[meeting]
    if (locationType === "hybrid") {
      return {
        id: meeting,
        label: `${format} · ${meta.label}`,
        icon: meta.icon,
        formatLabel: format,
      }
    }
    return { id: meeting, label: meta.label, icon: meta.icon, formatLabel: format }
  }

  const formatId = (locationType === "online" || locationType === "hybrid"
    ? locationType
    : "in-person") as EventPlatformId
  const meta = EVENT_PLATFORM_META[formatId]
  return { id: formatId, label: meta.label, icon: meta.icon }
}

export function listPlatformFilterOptions(
  events: Array<{ platformId: string; platform: string; platformIcon: string }>
): Array<{ id: string; label: string; icon: string }> {
  const seen = new Map<string, { id: string; label: string; icon: string }>()
  for (const e of events) {
    if (!seen.has(e.platformId)) {
      seen.set(e.platformId, { id: e.platformId, label: e.platform, icon: e.platformIcon })
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label))
}
