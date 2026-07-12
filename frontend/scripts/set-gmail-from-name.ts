/**
 * Set the Gmail "Send mail as" display name for SMTP_USER.
 * Gmail ignores / overwrites From display names from SMTP — the account
 * sendAs displayName is what recipients actually see.
 *
 * Run: npx tsx --env-file=.env.local scripts/set-gmail-from-name.ts
 */
import { getEmailFromParts } from "../lib/email/config"
import { refreshGoogleAccessToken } from "../lib/email/google-oauth"

async function main() {
  const user = process.env.SMTP_USER?.trim()
  if (!user) {
    console.error("Missing SMTP_USER")
    process.exit(1)
  }

  const { name, address } = getEmailFromParts()
  const sendAsEmail = address || user

  const token = await refreshGoogleAccessToken()
  if (!token.ok) {
    console.error("Token refresh failed:", token.error)
    process.exit(1)
  }

  console.log("SMTP_USER:", user)
  console.log("Setting sendAs display name:")
  console.log(`  ${name} <${sendAsEmail}>`)

  const listRes = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/settings/sendAs",
    { headers: { Authorization: `Bearer ${token.accessToken}` } }
  )
  const listBody = (await listRes.json()) as {
    sendAs?: Array<{ sendAsEmail?: string; displayName?: string; isPrimary?: boolean }>
    error?: { message?: string }
  }

  if (!listRes.ok) {
    console.error("Failed to list sendAs:", listBody.error?.message || listBody)
    process.exit(1)
  }

  console.log("\nCurrent sendAs identities:")
  for (const entry of listBody.sendAs ?? []) {
    console.log(
      `  - ${entry.displayName || "(no name)"} <${entry.sendAsEmail}>` +
        (entry.isPrimary ? " [primary]" : "")
    )
  }

  const encoded = encodeURIComponent(sendAsEmail)
  const patchRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/settings/sendAs/${encoded}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sendAsEmail,
        displayName: name,
        treatAsAlias: false,
      }),
    }
  )

  const patchBody = await patchRes.json().catch(() => ({}))
  if (!patchRes.ok) {
    // Fallback: PATCH only displayName (works when identity already exists)
    const patchOnly = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/settings/sendAs/${encoded}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: name }),
      }
    )
    const patchOnlyBody = await patchOnly.json().catch(() => ({}))
    if (!patchOnly.ok) {
      console.error("Failed to update sendAs:", patchBody, patchOnlyBody)
      console.error(`
Manual fix (works the same):
  1. Sign in to Gmail as ${user}
  2. Settings → See all settings → Accounts and Import
  3. Send mail as → edit info for ${sendAsEmail}
  4. Set name to: ${name}
`)
      process.exit(1)
    }
    console.log("\nUpdated via PATCH:", patchOnlyBody)
  } else {
    console.log("\nUpdated:", patchBody)
  }

  console.log("\nDone. New emails should show:")
  console.log(`  From: ${name} <${sendAsEmail}>`)
  console.log("\nSend a test:")
  console.log(`  npx tsx --env-file=.env.local scripts/test-smtp.ts ${user}`)
}

main().catch((err) => {
  console.error("FAILED:", err instanceof Error ? err.message : err)
  process.exit(1)
})
