/**
 * Get GOOGLE_REFRESH_TOKEN without OAuth Playground (avoids client mismatch).
 *
 * 1. Google Cloud → Credentials → your Web OAuth client → add redirect URI:
 *    http://localhost:3333/oauth/callback
 * 2. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local
 * 3. Run:
 *    npx tsx --env-file=.env.local scripts/google-oauth-local.ts
 * 4. Open the printed URL in browser → sign in as nairobi.membership@impacthub.net → Allow
 * 5. Paste printed GOOGLE_REFRESH_TOKEN into both .env.local files
 * 6. npx tsx --env-file=.env.local scripts/verify-google-oauth.ts
 */
import dns from "node:dns"
import http from "node:http"
import { URL } from "node:url"

dns.setDefaultResultOrder("ipv4first")

const PORT = 3333
const REDIRECT_URI = `http://localhost:${PORT}/oauth/callback`
const SCOPE = "https://mail.google.com/"

async function exchangeCode(code: string, clientId: string, clientSecret: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  })
  return { ok: res.ok, status: res.status, body: await res.json() }
}

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  const user = process.env.SMTP_USER?.trim() || "nairobi.membership@impacthub.net"

  if (!clientId || !clientSecret) {
    console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local")
    process.exit(1)
  }

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("scope", SCOPE)
  authUrl.searchParams.set("access_type", "offline")
  authUrl.searchParams.set("prompt", "consent")
  authUrl.searchParams.set("login_hint", user)

  console.log("\n=== Google OAuth (local) ===\n")
  console.log("Before continuing, add this redirect URI to your Web OAuth client in Google Cloud:")
  console.log(`  ${REDIRECT_URI}\n`)
  console.log("Then open this URL in your browser (sign in as", user + "):\n")
  console.log(authUrl.toString())
  console.log("\nWaiting for callback on", REDIRECT_URI, "...\n")

  await new Promise<void>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        if (!req.url?.startsWith("/oauth/callback")) {
          res.writeHead(404)
          res.end("Not found")
          return
        }

        const url = new URL(req.url, `http://localhost:${PORT}`)
        const err = url.searchParams.get("error")
        const code = url.searchParams.get("code")

        if (err) {
          res.writeHead(400, { "Content-Type": "text/html" })
          res.end(`<h1>Authorization failed</h1><p>${err}</p>`)
          reject(new Error(err))
          server.close()
          return
        }

        if (!code) {
          res.writeHead(400, { "Content-Type": "text/html" })
          res.end("<h1>Missing code</h1>")
          return
        }

        const result = await exchangeCode(code, clientId, clientSecret)

        if (!result.ok) {
          res.writeHead(500, { "Content-Type": "text/html" })
          res.end(`<h1>Token exchange failed</h1><pre>${JSON.stringify(result.body, null, 2)}</pre>`)
          reject(new Error(JSON.stringify(result.body)))
          server.close()
          return
        }

        let tokenMailbox = "(unknown)"
        try {
          const accessToken = result.body.access_token as string | undefined
          if (accessToken) {
            const gmailRes = await fetch(
              "https://gmail.googleapis.com/gmail/v1/users/me/profile",
              { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            const gmail = (await gmailRes.json()) as { emailAddress?: string }
            if (gmail.emailAddress) tokenMailbox = gmail.emailAddress
          }
        } catch {
          // best-effort
        }

        res.writeHead(200, { "Content-Type": "text/html" })
        res.end(
          `<h1>Success</h1><p>Authorized as <strong>${tokenMailbox}</strong>.</p><p>You can close this tab and return to the terminal.</p>`
        )

        console.log("Success! Authorized as:", tokenMailbox)
        if (tokenMailbox.toLowerCase() !== user.toLowerCase()) {
          console.warn(
            `\nWARNING: You signed in as ${tokenMailbox}, but SMTP_USER is ${user}.\nRe-run and choose ${user}, or SMTP will fail with 535 BadCredentials.\n`
          )
        }
        console.log("\nAdd to both .env.local files:\n")
        console.log(`GOOGLE_REFRESH_TOKEN=${result.body.refresh_token}\n`)
        if (!result.body.refresh_token) {
          console.warn("No refresh_token — revoke app at myaccount.google.com/permissions and run again.")
        }
        console.log("Then run:")
        console.log("  npx tsx --env-file=.env.local scripts/verify-google-oauth.ts")
        console.log("  npx tsx --env-file=.env.local scripts/test-smtp.ts", user)

        server.close()
        resolve()
      } catch (e) {
        reject(e)
        server.close()
      }
    })

    server.listen(PORT, "127.0.0.1", () => {})
    server.on("error", reject)
  })
}

main().catch((e) => {
  console.error("FAILED:", e instanceof Error ? e.message : e)
  process.exit(1)
})
