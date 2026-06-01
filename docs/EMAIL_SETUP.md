# Email setup (Impact Hub Nairobi community platform)

**Production setup:** [GOOGLE_WORKSPACE_EMAIL.md](./GOOGLE_WORKSPACE_EMAIL.md) — send as `dennis.ndungu@impacthub.net` via Google SMTP (no Brevo / no `impacthub.net` DNS for a third party).

The apps send transactional email through **SMTP** (Nodemailer) or optionally [Resend](https://resend.com). Change only environment variables to switch providers.

## Alternatives when you cannot verify `impacthub.net` DNS

| Option | DNS on impacthub.net? | From address | Best for |
|--------|------------------------|--------------|----------|
| **Google Workspace SMTP** | No (uses Google) | `dennis.ndungu@impacthub.net` | You already have that mailbox on Google |
| **Microsoft 365 SMTP** | No (uses Microsoft) | `dennis.ndungu@impacthub.net` | Mailbox on Outlook / M365 |
| **SendGrid** (single sender) | No — verify one email via link | That one email only | Quick third-party SMTP |
| **Mailjet** (single sender) | No — verify sender email | That one email only | Similar to SendGrid |
| **Brevo** | Optional domain; sender email only | Verified sender | After Brevo activates SMTP |
| **Resend / Mailgun / SES** | **Yes** — domain DNS required | `@yourdomain` | Skip until DNS access exists |

### Option A — Google Workspace (recommended if you have the mailbox)

If `dennis.ndungu@impacthub.net` is a real Google Workspace inbox:

1. Google Admin → user → **App passwords** (or account.google.com/apppasswords with 2FA).
2. Create an app password for “Mail”.
3. Set in `.env.local` / Vercel:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dennis.ndungu@impacthub.net
SMTP_PASS=<16-char app password>
SMTP_SECURE=false
EMAIL_FROM=Impact Hub Nairobi <dennis.ndungu@impacthub.net>
```

Limits: ~500–2000/day per Google policy; fine for a community app.

### Option B — Microsoft 365

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=dennis.ndungu@impacthub.net
SMTP_PASS=<mailbox password or app password>
```

Enable SMTP AUTH for the mailbox in M365 admin if disabled.

### Option C — SendGrid (no domain DNS)

1. [SendGrid](https://sendgrid.com) free tier → **Settings** → **Sender Authentication** → **Single Sender Verification**.
2. Add `dennis.ndungu@impacthub.net` → confirm the email link (no DNS).
3. **Settings** → **API Keys** → create key, then use SMTP:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your SendGrid API key>
EMAIL_FROM=Impact Hub Nairobi <dennis.ndungu@impacthub.net>
```

(`SMTP_USER` is literally the word `apikey` for SendGrid.)

### Test after any switch

```bash
cd Community-App/frontend
npx tsx --env-file=.env.local scripts/test-smtp.ts dennis.ndungu@impacthub.net
```

---

## Recommended: Brevo SMTP (no custom domain on Resend required)

[Brevo](https://www.brevo.com) (formerly Sendinblue) offers free SMTP (~300 emails/day). You verify a **sender email** (e.g. `dennis.ndungu@impacthub.net`), not a full DNS domain on Resend.

### 1. Create a Brevo account

1. Sign up at [https://www.brevo.com](https://www.brevo.com).
2. **Settings** → **SMTP & API** → **SMTP**.
3. Create an SMTP key / use the login shown (host, port, user, password).

Typical values:

| Setting | Value |
|---------|--------|
| Host | `smtp-relay.brevo.com` |
| Port | `587` |
| User | Your Brevo login email |
| Password | SMTP key from Brevo |

### 2. Verify the sender address

1. Brevo → **Senders & IP** → **Senders** → add `dennis.ndungu@impacthub.net`.
2. Confirm the verification email Brevo sends to that inbox (check Dennis’s mailbox).

`EMAIL_FROM` must match the verified sender exactly:

```env
EMAIL_FROM="Impact Hub Nairobi <dennis.ndungu@impacthub.net>"
```

### 3. Environment variables (both apps)

Set the same values on **Community-App** (frontend) and **Community-app-admin** (Vercel → Environment Variables):

| Variable | Example | Required |
|----------|---------|----------|
| `EMAIL_PROVIDER` | `smtp` | Recommended (forces SMTP) |
| `SMTP_HOST` | `smtp-relay.brevo.com` | Yes |
| `SMTP_PORT` | `587` | Yes |
| `SMTP_USER` | your Brevo login email | Yes |
| `SMTP_PASS` | Brevo SMTP key | Yes |
| `SMTP_SECURE` | `false` | For port 587 |
| `EMAIL_FROM` | `Impact Hub Nairobi <dennis.ndungu@impacthub.net>` | Yes |
| `EMAIL_STAFF_TO` | `dennis.ndungu@impacthub.net` | Member app (workspace inquiries and staff notifications) |

Redeploy both projects after saving.

### 4. Local development

`Community-App/frontend/.env`:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-login@example.com
SMTP_PASS=your-smtp-key
SMTP_SECURE=false
EMAIL_FROM="Impact Hub Nairobi <dennis.ndungu@impacthub.net>"
EMAIL_STAFF_TO="dennis.ndungu@impacthub.net"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`Community-app-admin/.env` — same SMTP and `EMAIL_FROM` values, plus:

```env
NEXT_PUBLIC_COMMUNITY_APP_URL="http://localhost:3000"
CRON_SECRET="local-dev-secret"
```

Without SMTP or Resend configured, the apps still run but emails are skipped (warnings in logs: `[EMAIL]`).

## Alternative: your email host’s SMTP

If `nairobi@impacthub.net` is on Google Workspace, Zoho, or another host, use that provider’s SMTP settings instead of Brevo. Set `EMAIL_FROM` to an address that host allows you to send as.

## Optional: Resend (requires verified domain)

Resend does **not** allow sending from free domains (Gmail, etc.) and requires DNS on a domain you control. If you have `impacthubnairobi.org` verified in Resend, set:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM="Impact Hub Nairobi <noreply@impacthubnairobi.org>"
```

See [RESEND_SETUP.md](./RESEND_SETUP.md) for Resend-only steps.

If both SMTP and `RESEND_API_KEY` are set, **SMTP is used** unless `EMAIL_PROVIDER=resend`.

## Member app (Community-App) — extra variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Links in password reset and event emails |

## Admin app — extra variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_COMMUNITY_APP_URL` | Event links in blast/reminder emails |
| `CRON_SECRET` | Protects `GET /api/cron/event-reminders` |

### Event reminder cron

```http
GET https://<admin-app>/api/cron/event-reminders
Authorization: Bearer <CRON_SECRET>
```

Set `reminderHoursBefore` on an event in admin **Settings** (e.g. `24`).

## Test checklist

1. **Password reset** — `/forgot-password` with a real account.
2. **Event registration** — register; check confirmation / pending email.
3. **Admin blast** — Events → Communications → send to yourself.
4. **Workspace inquiry** — submit private office / event space form.

Check Brevo → **Transactional** → **Email logs** (or your host’s sent folder) for delivery.

## Emails the platform sends

| Trigger | App | Recipient |
|---------|-----|-----------|
| Forgot password | Member | Member |
| Event registration | Member | Registrant |
| Application approved / rejected / promoted | Both | Registrant |
| Event communication blast | Admin | Audience |
| Event reminder cron | Admin | Registered guests |
| Workspace inquiry | Member | Member + staff |

## Troubleshooting

- **Brevo: `525 5.7.1 Unauthorized IP address`** — SMTP IP blocking is on. In Brevo: account menu → **Settings** → **Security** → **Authorized IPs**. Either **authorize** your server IP (check Brevo notification email for the blocked IP) or **deactivate blocking for SMTP keys** (required for **Vercel** — serverless IPs change and cannot be allowlisted). Then rerun `npx tsx --env-file=.env.local scripts/test-smtp.ts`.
- **Brevo: “SMTP account is not yet activated” (502)** — New Brevo accounts must complete onboarding (profile, use case) and may need SMTP enabled by support. In Brevo: **Settings** → **SMTP & API** — check for an activation banner. Contact Brevo support or `contact@sendinblue.com` if sends fail with 502 and **Transactional** logs stay empty.
- **Forgot password: no email, no Brevo log** — Usually SMTP never connected (inactive account) or the user has **no password** (Google-only sign-in). Reset only runs for accounts with a stored password.
- **Emails not sent** — Confirm `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` on Vercel and redeploy. Search logs for `[EMAIL]` or `[FORGOT PASSWORD]`.
- **Sender not verified** — Brevo blocks until the sender email is verified.
- **Authentication failed** — Regenerate SMTP key; use the SMTP password, not the account login password (unless your host says otherwise).
- **Wrong links** — Set `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_COMMUNITY_APP_URL` to production URLs.
