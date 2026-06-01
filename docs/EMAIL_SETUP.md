# Email setup (Impact Hub Nairobi community platform)

The apps send transactional email through **SMTP** (recommended) or optionally [Resend](https://resend.com). Use SMTP if you do not own a custom domain for Resend verification — for example with **Brevo** (free tier) or your existing mailbox host.

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

- **Emails not sent** — Confirm `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` on Vercel and redeploy. Search logs for `[EMAIL]`.
- **Sender not verified** — Brevo blocks until the sender email is verified.
- **Authentication failed** — Regenerate SMTP key; use the SMTP password, not the account login password (unless your host says otherwise).
- **Wrong links** — Set `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_COMMUNITY_APP_URL` to production URLs.
