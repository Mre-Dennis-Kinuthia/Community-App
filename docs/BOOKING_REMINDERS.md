# Booking reminders — implementation plan

Send members in-app and email reminders before their workspace bookings, using the existing serverless stack (Next.js on Vercel, Neon Postgres, SMTP/Resend).

## Context

### What exists today

| Piece | Status | Location |
|-------|--------|----------|
| Booking creation | Done | `frontend/app/api/bookings/route.ts` |
| Confirmation in-app notification | Done | `NotificationTemplates.bookingConfirmed` in `frontend/lib/notifications.ts` |
| Confirmation email | Done | `sendBookingConfirmationEmail` in `frontend/lib/email/messages.ts` |
| Cancellation email | Done | `sendBookingCancelledEmail` |
| Protected Vercel Cron (membership) | Done | `frontend/app/api/cron/membership/route.ts`, `frontend/vercel.json` |
| Event reminder cron (reference pattern) | Done | `Community-app-admin/app/api/cron/event-reminders/route.ts` |
| Booking reminder fields on model | **Missing** | `WorkspaceBooking` in `frontend/prisma/schema.prisma` |
| Booking reminder cron | **Missing** | — |
| Booking reminder email template | **Missing** | — |

### Architecture constraint

There is no long-running backend. API routes are serverless functions on Vercel. Scheduled work must be triggered externally — either **Vercel Cron** (poll-based) or a **job scheduler** (event-based, e.g. Inngest / QStash).

**Recommended for v1:** Vercel Cron, mirroring the event-reminder pattern already used in the admin app.

---

## Goals

1. Members receive a reminder **24 hours before** a confirmed booking (configurable).
2. Reminders are delivered via **in-app notification** and **email** (when email is configured).
3. Each booking receives **at most one** reminder (`reminderSentAt` idempotency).
4. Cancelled bookings are **never** reminded.
5. The cron endpoint is **protected** with `CRON_SECRET`.

### Non-goals (v1)

- Per-member reminder preferences (opt-out, custom lead time).
- SMS or push notifications.
- Sub-hour precision (hourly cron is acceptable).

---

## High-level flow

```
Member books workspace
        │
        ▼
POST /api/bookings
  → confirmation notification + email (already implemented)
        │
        │  (hours later)
        ▼
Vercel Cron (hourly)
        │
        ▼
GET /api/cron/booking-reminders
  → query upcoming confirmed bookings where reminderSentAt IS NULL
  → for each: if now >= startAt - reminderHoursBefore
        → in-app notification
        → reminder email
        → set reminderSentAt
```

---

## Implementation steps

### Step 1 — Schema migration

Add reminder tracking to `WorkspaceBooking` in `frontend/prisma/schema.prisma`:

```prisma
model WorkspaceBooking {
  // ... existing fields ...

  reminderHoursBefore  Int?      @default(24)
  reminderSentAt       DateTime?

  // ... existing indexes ...
  @@index([date, status, reminderSentAt])
}
```

Create and apply migration:

```bash
cd frontend
npx prisma migrate dev --name booking_reminders
```

For Neon production, apply the generated SQL via the Neon console or `prisma migrate deploy` in CI.

**Notes:**

- `reminderHoursBefore` defaults to 24 so existing rows behave predictably after migration.
- The composite index supports the cron query (`status`, `date`, `reminderSentAt`).

---

### Step 2 — Booking start datetime helper

Bookings store `date` (DateTime) and `startTime` (string, e.g. `"09:00"`). Combine them in **Africa/Nairobi** before comparing to `now`.

Add `frontend/lib/booking-datetime.ts`:

```typescript
const BOOKING_TIMEZONE = "Africa/Nairobi"

/** Returns the booking start as a UTC Date, or null if startTime is invalid. */
export function getBookingStartAt(
  date: Date | string,
  startTime: string,
  timeZone = BOOKING_TIMEZONE
): Date | null {
  // Parse date as calendar day in timeZone, attach startTime hours/minutes
  // Use Intl or a small helper (date-fns-tz / luxon if already in deps)
}
```

Use this helper in the cron job and anywhere else start time matters. Do **not** rely on `new Date(booking.date)` alone — it can shift the calendar day relative to Nairobi.

---

### Step 3 — Notification template

Add to `NotificationTemplates` in `frontend/lib/notifications.ts`:

```typescript
bookingReminder: (bookingId: string, resourceType: string, date: string, time: string) => ({
  title: "Booking Reminder",
  message: `Reminder: your ${resourceType} booking is on ${date} at ${time}.`,
  type: "info" as const,
  category: "booking",
  actionUrl: `/dashboard/bookings/${bookingId}`,
  relatedId: bookingId,
  relatedType: "booking",
}),
```

---

### Step 4 — Reminder email template

Add `sendBookingReminderEmail` to `frontend/lib/email/messages.ts`, following `sendEventReminderEmail` and reusing `formatBookingDate`, `formatBookingTimeRange`, `formatResourceType`, and `getDashboardBookingUrl`.

Export it from `frontend/lib/email.ts`.

**Suggested subject:** `Reminder: your {resource} booking tomorrow` (or dynamic based on lead time).

---

### Step 5 — Reminder sender module

Add `frontend/lib/booking-reminders.ts` with a function similar to `sendEventReminder` in the admin app:

```typescript
export async function sendBookingReminder(booking: {
  id: string
  userId: string
  resourceType: string
  date: Date
  startTime: string
  endTime?: string | null
  user: { email: string | null; name: string | null }
}) {
  // 1. createNotification with NotificationTemplates.bookingReminder
  // 2. sendEmailInBackground → sendBookingReminderEmail (if user.email)
  // 3. prisma.workspaceBooking.update({ reminderSentAt: new Date() })
}
```

Keep email sends non-blocking via `sendEmailInBackground` (same as booking confirmation).

---

### Step 6 — Cron API route

Create `frontend/app/api/cron/booking-reminders/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getBookingStartAt } from "@/lib/booking-datetime"
import { sendBookingReminder } from "@/lib/booking-reminders"
import { isEmailConfigured } from "@/lib/email"

export const dynamic = "force-dynamic"

/**
 * GET /api/cron/booking-reminders
 * Vercel Cron: send reminders for upcoming confirmed bookings.
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  if (secret) {
    const auth = request.headers.get("authorization")
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const now = new Date()

  const bookings = await prisma.workspaceBooking.findMany({
    where: {
      status: "confirmed",
      reminderSentAt: null,
      date: { gte: startOfTodayNairobi() }, // or a rolling window
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  })

  const sent: string[] = []
  const skipped: string[] = []

  for (const booking of bookings) {
    const startAt = getBookingStartAt(booking.date, booking.startTime)
    if (!startAt || startAt <= now) {
      skipped.push(booking.id)
      continue
    }

    const hours = booking.reminderHoursBefore ?? 24
    const reminderAt = new Date(startAt.getTime() - hours * 60 * 60 * 1000)

    if (now >= reminderAt) {
      await sendBookingReminder(booking)
      sent.push(booking.id)
    } else {
      skipped.push(booking.id)
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    skippedCount: skipped.length,
    timestamp: now.toISOString(),
    emailEnabled: isEmailConfigured(),
  })
}
```

**Query tuning:** Optionally narrow `date` to `today` and `tomorrow` in Nairobi to avoid scanning distant future bookings on every run.

---

### Step 7 — Register Vercel Cron

Update `frontend/vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/membership",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/booking-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

Hourly cron means a “24 hours before” reminder fires within roughly a one-hour window of the target time. That is usually sufficient for workspace bookings.

**Vercel plan note:** Confirm your plan supports the cron frequency you need. Hobby plans have stricter limits than Pro.

---

### Step 8 — Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `CRON_SECRET` | Yes (production) | Protects `GET /api/cron/booking-reminders` |
| `SMTP_*` or Resend vars | For email | Same as existing transactional email |
| `NEXT_PUBLIC_APP_URL` | Yes | Links in reminder emails |

No new secrets beyond `CRON_SECRET` (already used by membership cron).

---

### Step 9 — Documentation updates

After implementation, update:

- `docs/EMAIL_SETUP.md` — add booking reminder cron to the emails table and cron section.
- `BACKEND.md` — note booking reminders under Notifications / background jobs.

---

## Testing plan

### Local / preview

1. Apply migration and run `npx prisma generate`.
2. Create a test booking with `date` = tomorrow and `startTime` = a fixed hour.
3. Set `reminderHoursBefore` to `24` (or temporarily `48` and adjust `date` for faster testing).
4. Manually invoke the cron:

   ```bash
   curl -s -H "Authorization: Bearer $CRON_SECRET" \
     http://localhost:3000/api/cron/booking-reminders | jq
   ```

5. Verify:
   - In-app notification appears (bell icon / `/api/notifications`).
   - Reminder email received (or logged if SMTP not configured locally).
   - `reminderSentAt` is set on the booking row.
   - Second cron run does **not** send again.

### Edge cases

| Case | Expected behavior |
|------|-------------------|
| Booking cancelled before reminder | No reminder (`status !== "confirmed"`) |
| Booking in the past | Skipped (`startAt <= now`) |
| User has no email | In-app notification only |
| Cron runs twice in same hour | Idempotent via `reminderSentAt` |
| Booking created &lt; 24h before start | Reminder sends on next cron once `now >= reminderAt` (immediate-ish reminder) |

### Production smoke test

1. Deploy with `CRON_SECRET` set on Vercel.
2. Create a real booking 25–26 hours out.
3. Wait for the next hourly cron (or trigger manually with production `CRON_SECRET`).
4. Check Vercel function logs for `[CRON]` / `[NOTIFICATIONS]` / `[EMAIL]` entries.

---

## Alternative: exact-time scheduling (v2)

If sub-hour precision is required, schedule a one-off job when the booking is created instead of polling.

| Option | Trigger | Pros | Cons |
|--------|---------|------|------|
| **Vercel Cron** (v1) | Hourly HTTP GET | Simple; matches event reminders | Up to ~1h timing drift |
| **Inngest** | `inngest.send({ ts })` on booking create | Exact delay per booking | New dependency + setup |
| **Upstash QStash** | Schedule HTTP callback at `reminderAt` | Lightweight serverless queue | Another service to manage |

Example (Inngest) — enqueue in `POST /api/bookings` after create:

```typescript
await inngest.send({
  name: "booking/reminder",
  data: { bookingId: booking.id },
  ts: reminderAt.getTime(),
})
```

The Inngest function would call the same `sendBookingReminder` logic as the cron route.

---

## File checklist

| Action | File |
|--------|------|
| Modify | `frontend/prisma/schema.prisma` |
| Add | `frontend/prisma/migrations/..._booking_reminders/migration.sql` |
| Add | `frontend/lib/booking-datetime.ts` |
| Add | `frontend/lib/booking-reminders.ts` |
| Modify | `frontend/lib/notifications.ts` |
| Modify | `frontend/lib/email/messages.ts` |
| Modify | `frontend/lib/email.ts` (re-export) |
| Add | `frontend/app/api/cron/booking-reminders/route.ts` |
| Modify | `frontend/vercel.json` |
| Modify | `docs/EMAIL_SETUP.md` |
| Modify | `BACKEND.md` |

---

## Rollout

1. Merge schema migration and deploy to a preview environment.
2. Test cron manually on preview with `CRON_SECRET`.
3. Deploy to production; confirm `CRON_SECRET` is set.
4. Monitor first 24–48 hours of cron invocations in Vercel logs.
5. Optionally add admin visibility later (e.g. “reminder sent at” on booking detail in admin app).

---

## Related code references

- Booking confirmation flow: `frontend/app/api/bookings/route.ts`
- Event reminder cron (pattern to copy): `Community-app-admin/app/api/cron/event-reminders/route.ts`
- Membership cron (auth pattern): `frontend/app/api/cron/membership/route.ts`
- Email infrastructure: `docs/EMAIL_SETUP.md`, `docs/GOOGLE_WORKSPACE_EMAIL.md`
