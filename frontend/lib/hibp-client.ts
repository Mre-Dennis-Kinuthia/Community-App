import { isHashSuffixInRangeResponse } from "@/lib/hibp"

const HIBP_RANGE_URL = "https://api.pwnedpasswords.com/range"
const HIBP_TIMEOUT_MS = 5000

async function sha1HexUpper(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const hash = await crypto.subtle.digest("SHA-1", data)
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
}

/** k-anonymity check against Have I Been Pwned (browser). */
export async function isPasswordPwnedClient(password: string): Promise<boolean> {
  const hash = await sha1HexUpper(password)
  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), HIBP_TIMEOUT_MS)

  try {
    const res = await fetch(`${HIBP_RANGE_URL}/${prefix}`, {
      signal: controller.signal,
      headers: { "Add-Padding": "true" },
    })

    if (!res.ok) {
      throw new Error(`HIBP API returned ${res.status}`)
    }

    const body = await res.text()
    return isHashSuffixInRangeResponse(suffix, body)
  } finally {
    clearTimeout(timeout)
  }
}
