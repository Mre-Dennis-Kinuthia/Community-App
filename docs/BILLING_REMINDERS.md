# Billing Reminders

Automated payment and subscription reminders for Impact Hub Nairobi members.

## Cron endpoint

```
GET /api/cron/billing-reminders
Authorization: Bearer <CRON_SECRET>
```

## Schedule (Vercel)

| Job | Path | Schedule (UTC) |
|-----|------|----------------|
| Membership jobs | `/api/cron/membership` | `0 6 * * *` (06:00 daily) |
| Billing reminders | `/api/cron/billing-reminders` | `0 7 * * *` (07:00 daily) |

Configured in `Community-App/frontend/vercel.json`.

## What it does

1. **Overdue invoices** — `status` overdue or past `dueDate`; marks overdue when applicable
2. **Due-soon invoices** — due within 3 days (`draft` / `open`)
3. **Expiring subscriptions** — `currentPeriodEnd` within 3 days, active, not cancelling

For each match:
- Creates in-app `Notification` (category: `billing`)
- Sends email when member email is configured
- Sets `Invoice.lastReminderAt` to prevent repeat within **7 days**

## Idempotency

Uses `Invoice.lastReminderAt` — no duplicate invoice reminders within 7 days.

Subscription reminders run daily without a cooldown field (low volume). Extend with `Subscription.lastReminderAt` if needed.

## Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `CRON_SECRET` | Recommended | Secures cron endpoints |
| `DATABASE_URL` | Yes | Neon PostgreSQL |
| Email provider | For emails | SMTP or Resend (see `docs/EMAIL_SETUP.md`) |
| `NEXT_PUBLIC_APP_URL` | Recommended | Links in reminder emails |

## Manual test

```bash
cd Community-App/frontend
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/billing-reminders
```

Expected response:

```json
{ "ok": true, "invoiceReminders": 0, "subscriptionReminders": 0 }
```

## Invoice PDF

Members download invoices from `/billing`:

```
GET /api/billing/invoices/[id]/pdf
```

Requires authenticated session; invoice must belong to the user. Sets `pdfUrl` on first generation.

## Accounting export (admin)

```
GET /api/admin/billing/export?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv
```

Button on **Admin → Finance → Billing** — "Export for accounting (CSV)".

Includes invoice and completed payment rows for the date range.

## Feature flags

Billing reminders and PDF/export are **not** behind feature flags — they work whenever invoices/payments exist.

Visitor and delivery features require:

- `visitorManagement: true`
- `deliveryManagement: true`
