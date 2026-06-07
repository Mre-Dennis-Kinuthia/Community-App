import { createHash } from "crypto"

const HIBP_RANGE_URL = "https://api.pwnedpasswords.com/range"
const HIBP_TIMEOUT_MS = 5000

function sha1HexUpper(password: string): string {
  return createHash("sha1").update(password, "utf8").digest("hex").toUpperCase()
}

export function isHashSuffixInRangeResponse(suffix: string, body: string): boolean {
  for (const line of body.split("\n")) {
    const [hashSuffix] = line.split(":")
    if (hashSuffix?.trim() === suffix) return true
  }
  return false
}

/** k-anonymity check against Have I Been Pwned (server-side). */
export async function isPasswordPwned(password: string): Promise<boolean> {
  const hash = sha1HexUpper(password)
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
