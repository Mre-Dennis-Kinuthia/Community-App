# Google Workspace email (Impact Hub Nairobi)

Send as **`dennis.ndungu@impacthub.net`** via Google SMTP + Nodemailer. No Brevo, no SendGrid, no `impacthub.net` DNS for a third party.

## Choose authentication

| Method | When to use |
|--------|-------------|
| **OAuth 2.0** (below) | No App Passwords, or Workspace admin disabled them |
| **App Password** | 2-Step Verification enabled and App Passwords allowed — set `SMTP_PASS` only |

---

## Recommended: Google OAuth 2.0 (no App Password)

### Step 1 — Google Cloud project

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project (e.g. `Impact Hub Community App`).
3. **APIs & Services** → **Library** → enable **Gmail API**.
4. **OAuth consent screen**:
   - User type: **Internal** (Workspace only) or **External** (if needed).
   - Add scope: `https://mail.google.com/` (full Gmail send).
   - Add test user: `dennis.ndungu@impacthub.net` (if External / Testing).
5. **Credentials** → **Create credentials** → **OAuth client ID** → **Web application**.
   - Authorized redirect URI: `https://developers.google.com/oauthplayground`
6. Copy **Client ID** and **Client secret**.

You can reuse the same client as “Sign in with Google” if that app already exists — but you still need a **separate refresh token** with the mail scope.

### Step 2 — Get a refresh token (one time)

1. Open [OAuth 2.0 Playground](https://developers.google.com/oauthplayground).
2. Click the **gear** (OAuth settings) → check **Use your own OAuth credentials** → paste Client ID and Secret.
3. In **Step 1**, find **Gmail API v1** → select  
   `https://mail.google.com/`  
   Click **Authorize APIs**.
4. Sign in as **`dennis.ndungu@impacthub.net`** and allow access.
5. **Step 2** → **Exchange authorization code for tokens**.
6. Copy the **Refresh token** (long string). Store it securely — it does not expire unless revoked.

### Step 3 — Environment variables

Set in **`Community-App/frontend/.env.local`** and **`Community-app-admin/.env.local`** (and Vercel):

```env
EMAIL_PROVIDER=smtp
SMTP_USER=dennis.ndungu@impacthub.net
EMAIL_FROM=Impact Hub Nairobi <dennis.ndungu@impacthub.net>
EMAIL_STAFF_TO=dennis.ndungu@impacthub.net

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token

# Leave empty when using OAuth (do not set SMTP_PASS)
# SMTP_PASS=
```

`SMTP_HOST` / `SMTP_PORT` are optional with OAuth — Nodemailer uses `service: gmail`.

Restart dev servers after saving.

### Step 4 — Test

```bash
cd Community-App/frontend
npx tsx --env-file=.env.local scripts/test-smtp.ts dennis.ndungu@impacthub.net
```

Expect `Sent: ...` and mail in the inbox. Then test **Forgot password**.

### Step 5 — Vercel

Add the same variables to **both** Vercel projects. Also set:

| Member app | Admin app |
|------------|-----------|
| `NEXT_PUBLIC_APP_URL=https://impacthubnairobi-app.vercel.app` | `NEXT_PUBLIC_COMMUNITY_APP_URL=https://impacthubnairobi-app.vercel.app` |

Redeploy both.

---

## Alternative: App Password

Only if App Passwords are allowed on the account:

1. Enable **2-Step Verification** on `dennis.ndungu@impacthub.net`.
2. Create App Password: https://myaccount.google.com/apppasswords
3. Env:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dennis.ndungu@impacthub.net
SMTP_PASS=16-char-app-password
SMTP_SECURE=false
```

Do **not** set `GOOGLE_REFRESH_TOKEN` if using App Password.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `SMTP not configured` | Set OAuth trio + `SMTP_USER`, or `SMTP_PASS` for App Password. |
| `Invalid grant` | Refresh token revoked or wrong client ID/secret. Repeat OAuth Playground flow. |
| `Access Not Configured` | Enable **Gmail API** in Cloud Console. |
| `insufficient permissions` | Refresh token missing `https://mail.google.com/` scope — get a new token. |
| Consent screen blocks users | Add Dennis as test user, or publish app (Internal apps skip this). |

## Other providers

See [EMAIL_SETUP.md](./EMAIL_SETUP.md).
