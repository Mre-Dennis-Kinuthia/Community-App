export function formatLocationType(locationType?: string | null): string {
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

export function eventTypeLabel(eventType?: string | null): string {
  const labels: Record<string, string> = {
    workshop: "Workshop",
    meetup: "Meetup",
    conference: "Conference",
    networking: "Networking",
    seminar: "Seminar",
    hackathon: "Hackathon",
    "demo-day": "Demo Day",
    other: "Event",
  }
  return labels[eventType ?? ""] ?? "Event"
}

export function displayLocation(event: {
  locationType?: string | null
  location?: string | null
  onlineUrl?: string | null
}): string {
  if (event.locationType === "online") {
    return event.onlineUrl || event.location || "Online"
  }
  if (event.locationType === "hybrid") {
    const parts = [event.location, event.onlineUrl ? "Online link provided" : null].filter(Boolean)
    return parts.join(" · ")
  }
  return event.location || "TBD"
}
