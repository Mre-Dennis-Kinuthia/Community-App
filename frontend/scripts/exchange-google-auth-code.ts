/**
 * Exchange an OAuth authorization code using YOUR .env client ID/secret.
 *
 * 1. OAuth Playground → gear → Use your own OAuth credentials (same as .env)
 * 2. Step 1 → https://mail.google.com/ only → Authorize as Dennis
 * 3. Copy the "Authorization code" from Playground Step 1
 * 4. Run immediately (codes expire in ~10 minutes):
 *    npx tsx --env-file=.env.local scripts/exchange-google-auth-code.ts "PASTE_CODE_HERE"
 *
 * If fetch times out on WSL, use the printed curl command instead.
 */
import dns from "node:dns"

// WSL often fails IPv6 to Google (ENETUNREACH) — prefer IPv4
dns.setDefaultResultOrder("ipv4first")

async function exchangeWithFetch(
  code: string,
  clientId: string,
  clientSecret: string
) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: controller.signal,
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: "https://developers.google.com/oauthplayground",
        grant_type: "authorization_code",
      }),
    })
    const body = await res.json()
    return { ok: res.ok, status: res.status, body }
  } finally {
    clearTimeout(timeout)
  }
}

function printCurlFallback(code: string, clientId: string, clientSecret: string) {
  console.error(`
Network error reaching Google. Try curl instead (from Community-App/frontend):

curl -s -X POST https://oauth2.googleapis.com/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "code=${encodeURIComponent(code)}" \\
  -d "client_id=${encodeURIComponent(clientId)}" \\
  -d "client_secret=${encodeURIComponent(clientSecret)}" \\
  -d "redirect_uri=https://developers.google.com/oauthplayground" \\
  -d "grant_type=authorization_code"

Copy refresh_token from the JSON into GOOGLE_REFRESH_TOKEN in both .env.local files.
`)
}

async function main() {
  const code = process.argv[2]?.trim()
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()

  if (!code) {
    console.error(
      'Usage: npx tsx --env-file=.env.local scripts/exchange-google-auth-code.ts "AUTHORIZATION_CODE"'
    )
    process.exit(1)
  }
  if (!clientId || !clientSecret) {
    console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local first")
    process.exit(1)
  }

  let result
  try {
    result = await exchangeWithFetch(code, clientId, clientSecret)
  } catch (error) {
    console.error("Request failed:", error instanceof Error ? error.message : error)
    printCurlFallback(code, clientId, clientSecret)
    process.exit(1)
  }

  if (!result.ok) {
    console.error("Exchange FAILED:", result.status, result.body)
    if (result.body?.error === "invalid_grant") {
      console.error("Authorization code expired or already used — get a new code from Playground Step 1.")
    }
    process.exit(1)
  }

  console.log("Success! Add this to .env.local (both apps):\n")
  console.log(`GOOGLE_REFRESH_TOKEN=${result.body.refresh_token}`)
  if (!result.body.refresh_token) {
    console.warn(
      "\nNo refresh_token — revoke at myaccount.google.com/permissions and authorize again."
    )
  }
  console.log("\nThen run:")
  console.log("  npx tsx --env-file=.env.local scripts/verify-google-oauth.ts")
}

main()
