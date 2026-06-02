/** Exchange a Google refresh token for a short-lived access token (Gmail SMTP). */

export type GoogleTokenResult =
  | { ok: true; accessToken: string }
  | { ok: false; error: string; code?: string }

export function humanizeGoogleTokenError(code: string | undefined, description?: string): string {
  if (code === "invalid_grant") {
    return "Google refresh token expired or revoked. Regenerate GOOGLE_REFRESH_TOKEN using scripts/google-oauth-local.ts and update Vercel."
  }
  if (code === "unauthorized_client") {
    return "GOOGLE_REFRESH_TOKEN was issued for a different OAuth client than GOOGLE_CLIENT_ID. Regenerate the refresh token for this Client ID."
  }
  if (code === "invalid_client") {
    return "GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is incorrect."
  }
  return description || code || "Google OAuth token refresh failed"
}

export async function refreshGoogleAccessToken(): Promise<GoogleTokenResult> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim()

  if (!clientId || !clientSecret || !refreshToken) {
    return { ok: false, error: "Google OAuth env vars are incomplete" }
  }

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
      signal: AbortSignal.timeout(15000),
    })

    const body = (await res.json().catch(() => ({}))) as {
      access_token?: string
      error?: string
      error_description?: string
    }

    if (!res.ok || !body.access_token) {
      return {
        ok: false,
        error: humanizeGoogleTokenError(body.error, body.error_description),
        code: body.error,
      }
    }

    return { ok: true, accessToken: body.access_token }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: message || "Google token request failed" }
  }
}
