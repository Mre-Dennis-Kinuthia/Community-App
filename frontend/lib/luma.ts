export type RegistrationProvider = "platform" | "luma"

export function isLumaUrl(url: string): boolean {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase()
    return host === "lu.ma" || host.endsWith(".lu.ma") || host === "luma.com" || host.endsWith(".luma.com")
  } catch {
    return false
  }
}

export function normalizeLumaEventUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ""
  try {
    const parsed = new URL(trimmed)
    return parsed.toString().replace(/\/$/, "")
  } catch {
    return trimmed
  }
}

/** Extract Luma event id (evt-…) from a public event URL when present. */
export function parseLumaEventId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  const fromPath = trimmed.match(/\/event\/(evt-[a-zA-Z0-9_-]+)/i)
  if (fromPath) return fromPath[1]
  const fromQuery = trimmed.match(/[?&]id=(evt-[a-zA-Z0-9_-]+)/i)
  if (fromQuery) return fromQuery[1]
  if (/^evt-[a-zA-Z0-9_-]+$/i.test(trimmed)) return trimmed
  return null
}

export function isLumaRegistration(provider?: string | null): boolean {
  return provider === "luma"
}

export function resolveLumaRegistration(event: {
  registrationProvider?: string | null
  lumaEventUrl?: string | null
  lumaEventId?: string | null
}): { url: string | null; eventId: string | null } {
  const url = event.lumaEventUrl?.trim() || null
  const eventId =
    event.lumaEventId?.trim() ||
    (url ? parseLumaEventId(url) : null) ||
    null
  return { url, eventId }
}
