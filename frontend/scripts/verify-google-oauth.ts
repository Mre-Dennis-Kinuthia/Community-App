/**
 * Verify Google OAuth credentials can refresh an access token,
 * and that the token belongs to the same mailbox as SMTP_USER.
 *
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

  const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${body.access_token}` },
  })
  const profile = (await infoRes.json().catch(() => ({}))) as { email?: string; error?: string }

  if (!infoRes.ok || !profile.email) {
    // mail.google.com scope alone may not expose userinfo — try Gmail profile
    const gmailRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: { Authorization: `Bearer ${body.access_token}` },
    })
    const gmail = (await gmailRes.json().catch(() => ({}))) as {
      emailAddress?: string
      error?: { message?: string }
    }
    if (gmailRes.ok && gmail.emailAddress) {
      printMatch(user, gmail.emailAddress)
      return
    }
    console.warn("Could not resolve token mailbox (userinfo/gmail profile).")
    console.warn("If SMTP still fails with 535 BadCredentials, re-run OAuth as", user)
    console.log("Next: npx tsx --env-file=.env.local scripts/test-smtp.ts", user)
    return
  }

  printMatch(user, profile.email)
}

function printMatch(smtpUser: string, tokenEmail: string) {
  const match = smtpUser.toLowerCase() === tokenEmail.toLowerCase()
  console.log("Token mailbox:", tokenEmail)
  if (!match) {
    console.error(`
MISMATCH: SMTP_USER is ${smtpUser}
but GOOGLE_REFRESH_TOKEN belongs to ${tokenEmail}.

Gmail SMTP will fail with 535 BadCredentials until they match.

If "${smtpUser}" is only a Send-as alias (not its own Google login):
  - Set SMTP_USER=${tokenEmail}
  - Keep EMAIL_FROM=Nairobi Membership <${smtpUser}>
  - In Gmail (as ${tokenEmail}) → Settings → Accounts → Send mail as
    → add ${smtpUser} and verify it

If it is a real separate mailbox:
  1. npx tsx --env-file=.env.local scripts/google-oauth-local.ts
  2. Sign in as ${smtpUser} (use "Use another account" if Google offers ${tokenEmail})
  3. Paste the NEW GOOGLE_REFRESH_TOKEN into both apps' .env.local
  4. Re-run this script — Token mailbox must equal SMTP_USER
`)
    process.exit(1)
  }

  console.log("Mailbox match OK")
  console.log("Next: npx tsx --env-file=.env.local scripts/test-smtp.ts", smtpUser)
}

main()
