/**
 * Verify Google OAuth credentials can refresh an access token.
 * Run: npx tsx --env-file=.env.local scripts/verify-google-oauth.ts
 */
async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim()
  const user = process.env.SMTP_USER?.trim()

  if (!clientId || !clientSecret || !refreshToken || !user) {
    console.error("Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, or SMTP_USER")
    process.exit(1)
  }

  console.log("SMTP_USER:", user)
  console.log("Client ID:", clientId.slice(0, 12) + "...")

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error("Token refresh FAILED:", res.status, body)
    if (body.error === "unauthorized_client") {
      console.error(`
Diagnosis: GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET are valid, but GOOGLE_REFRESH_TOKEN
was issued for a DIFFERENT OAuth client (often OAuth Playground default).

Fix — use the local OAuth script (not Playground):
  1. Google Cloud → Credentials → Web client ${clientId?.slice(0, 20)}...
     → add redirect URI: http://localhost:3333/oauth/callback
  2. Revoke old access: https://myaccount.google.com/permissions
  3. npx tsx --env-file=.env.local scripts/google-oauth-local.ts
  4. Open printed URL → sign in as ${user} → Allow
  5. Paste NEW refresh token into .env.local → run this script again
`)
    }
    process.exit(1)
  }

  console.log("Token refresh OK — access token received")
  console.log("Next: npx tsx --env-file=.env.local scripts/test-smtp.ts", user)
}

main()
