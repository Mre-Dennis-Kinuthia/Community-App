const RESOURCE_LABELS: Record<string, string> = {
  "hot-desk": "Hot desk",
  "meeting-room": "Meeting room",
  "private-office": "Private office",
  "event-space": "Event space",
}

export function formatResourceType(resourceType: string): string {
  return RESOURCE_LABELS[resourceType] ?? resourceType.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

export function formatBookingDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatBookingTimeRange(startTime: string, endTime?: string | null): string {
  return endTime ? `${startTime} – ${endTime}` : startTime
}
