import { randomBytes } from "crypto"

/** Short unique code for QR check-in (e.g. A1B2C3D4). */
export function generateCheckInCode(): string {
  return randomBytes(4).toString("hex").toUpperCase()
}

export function buildCheckInPayload(eventId: string, registrationId: string, code: string) {
  return JSON.stringify({ eventId, registrationId, code })
}

export function parseCheckInPayload(raw: string): {
  eventId: string
  registrationId: string
  code: string
} | null {
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.eventId && parsed?.registrationId && parsed?.code) {
      return parsed
    }
  } catch {
    // plain code only
  }
  return null
}
