# Backend & Implementation

## Architecture Decisions

The backend lives entirely as **Next.js API Route Handlers** (`/app/api`) inside the Community-App repo. There is no separate Node service; the `backend/` directory is a placeholder and can be removed once all endpoints are verified.

Both the Community App and the Admin App (`Community-app-admin`) share the same API. The Admin app calls Community-App's `/api` routes (same-origin or cross-origin with CORS).

**Deployment model:**
- Phase 1 (current): single Next.js app on Vercel; `/api` routes serve both frontends.
- Phase 2 (scale): split into a dedicated API app or edge functions if needed — same Neon + Prisma.

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Database | **Neon** (serverless Postgres) | Branchable DB, Vercel-native, serverless driver |
| ORM | **Prisma** | Type-safe schema, migrations, client |
| Framework | **Next.js** (App Router) | API routes in `/app/api` |
| Hosting | **Vercel** | Edge/Serverless for API routes |
| Auth | **Auth.js (next-auth)** | Credentials + Google OAuth; JWT sessions; HTTP-only cookies |
| File storage | **Vercel Blob** (recommended) or AWS S3 | Profile images, news images, resource files |
| Email | **Resend** or SendGrid | Transactional email |
| Payments | **Stripe** (international) + **M-Pesa / Safaricom Daraja** (Kenya) | |
| Background jobs | Vercel Cron / Inngest | Scheduled publishing, email, notifications |

**Admin roles:** `super_admin`, `content_manager`, `community_manager`, `programs_manager`, `finance_ops`

---

## Database Schema

### Complete Models (in schema.prisma)

- `User`, `Account`, `Session` — NextAuth standard tables
- `MemberProfile` — `industry`, `role`, `experienceLevel`, `availability`, `interests`, `isFeatured`
- `Connection`, `Follow`
- `NewsPost`, `Category`, `NewsTag`, `NewsPostComment`
- `Event`, `EventRegistration`
- `WorkspaceBooking`
- `Notification` — see schema below
- `AdminUser`
- `Partner`, `PartnerOpportunity` — `type`, `category`, `description`, `logoUrl`, `website`, `location`, `locationType`, `focus[]`, `contactEmail`, `isFeatured`
- `Project`, `ProjectFollow`, `ProjectVolunteer`, `ProjectCollaboration` — `category`, `stage`, `founderId`, `location`, `needs`, `website`, `socialLinks`, `launchDate`, `isFeatured`
- `Resource`
- `Plan`, `Subscription`, `Payment`, `PaymentMethod`, `Invoice`

### Notification Model

```prisma
model Notification {
  id          String    @id @default(cuid())
  userId      String?   // null = broadcast
  user        User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  message     String    @db.Text
  type        String    @default("info") // info | success | warning | error
  category    String?   // booking | event | news | payment | system
  read        Boolean   @default(false)
  readAt      DateTime?
  actionUrl   String?
  relatedId   String?
  relatedType String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime? // soft delete

  @@map("notifications")
  @@index([userId])
  @@index([read])
  @@index([createdAt])
  @@index([category])
}
```

### Models Still Needed (not yet in schema)

- `Program`, `Cohort`, `Application`
- `Space` (for granular space management)
- `Attendance`, `CheckIn`
- `AuditLog`
- `Role`, `RolePermission`

---

## API Coverage — What's Done

### Public Endpoints

| Route | Method | Notes |
|---|---|---|
| `/api/community` | GET | Members list — filtering, pagination, search |
| `/api/community/[id]` | GET | Individual member profile |
| `/api/events` | GET | Events list with filters |
| `/api/news` | GET | News posts list |
| `/api/news/[id]` | GET | Single news post |
| `/api/news/[id]/comments` | GET, POST | Comments on a post |
| `/api/categories` | GET | News categories |
| `/api/tags` | GET | News tags |
| `/api/workspace` | GET | Workspace info |
| `/api/availability` | GET | Availability for date + resource type |
| `/api/partners` | GET | Partners list — search, type, category, location |
| `/api/partners/[id]` | GET | Partner detail + opportunities |
| `/api/projects` | GET | Projects list — search, category, stage, location, featured |
| `/api/projects/[id]` | GET | Single project with full details |
| `/api/resources` | GET | Resources list — search, type, category |
| `/api/users` | GET | User list |

### Auth Endpoints

| Route | Method | Notes |
|---|---|---|
| `/api/auth/register` | POST | Email + password registration |
| `/api/auth/login` | POST | Credentials login |
| `/api/auth/[...nextauth]` | * | NextAuth session management, Google OAuth |

### Authenticated Endpoints

| Route | Method | Notes |
|---|---|---|
| `/api/profile` | GET, PUT | Current user's profile |
| `/api/connections` | GET, POST | List / send connection request |
| `/api/connections/[id]` | PUT, DELETE | Accept / reject / delete |
| `/api/follow` | POST, DELETE | Follow / unfollow |
| `/api/bookings` | GET, POST | List user bookings / create booking |
| `/api/bookings/upcoming` | GET | Upcoming bookings |
| `/api/bookings/[id]` | GET | Single booking (via `?id=`) |
| `/api/events/[id]/register` | POST | Register for event (capacity-checked) |
| `/api/notifications` | GET, POST | User notifications |
| `/api/notifications/[id]` | GET, PUT, DELETE | Single notification |
| `/api/notifications/mark-all-read` | POST | Mark all read |
| `/api/dashboard/stats` | GET | Dashboard statistics |
| `/api/billing` | GET | Subscription, payment methods, invoices |
| `/api/billing/mpesa` | POST | Initiate M-Pesa STK Push |

### Admin Endpoints

| Route | Method | Notes |
|---|---|---|
| `/api/admin/billing` | GET | All subscriptions + billing data |
| `/api/admin/resources` | GET, POST | List / create |
| `/api/admin/resources/[id]` | PUT, DELETE | Update / soft-delete |
| `/api/admin/partners` | GET, POST | List / create |
| `/api/admin/projects` | GET, POST | List / create |
| `/api/admin/notifications` | GET, POST | All notifications; create for any user |
| `/api/admin/news/upload-image` | POST | Image upload (cloud storage TODO) |

### Frontend Hooks Connected to API

- `useWorkspace` → `/api/workspace`
- `useCommunityMembers` → `/api/community`
- `useCommunityMember` → `/api/community/[id]`
- `useAvailability` → `/api/availability`
- `usePricing` → static data (not yet API-driven)

---

## Remaining Work

### Billing & Payments

- **M-Pesa (Daraja):** API endpoint exists (`POST /api/billing/mpesa`), but real STK push, callback handler, and env vars not wired up. Needs: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`.
- **Stripe:** Not integrated. Needs payment intent creation, webhooks, refund processing, subscription management.
- **Admin UI:** Pages for subscriptions, plans, payments, invoices not built.
- **Invoice PDF download:** `/api/invoices/[id]/download` not implemented.

### Global Search

- `components/global-search.tsx` has a TODO; no `/api/search` endpoint.
- Options: new route querying events, members, projects, partners, resources, news — or aggregate existing list APIs.

### Data Still Static / Placeholder

| Location | What's missing |
|---|---|
| `lib/hooks/use-pricing.ts` | Returns static pricing; needs `/api/workspace/pricing` or workspace API field |
| `lib/hooks/use-reviews.ts` | Mock data; replace if reviews feature is required |
| `app/community/[id]/page.tsx` | Project name fetched as raw ID; needs API lookup |
| `app/resources/programs/[id]/page.tsx` | Placeholder thumbnail/avatar when program not found |

### Auth Gaps

- `POST /api/auth/logout` — not implemented
- `POST /api/auth/forgot-password` / `reset-password` / `verify-email` — not implemented
- **LinkedIn OAuth** — UI shows "coming soon"; provider not added to NextAuth
- **Google OAuth** — code exists; confirm env vars set in production

### Admin App UI Pages Not Built

- Billing management (`/admin/billing`)
- Resources management (`/admin/resources`) — APIs exist, no UI
- Partners management (`/admin/partners`) — APIs exist, no UI
- Projects management (`/admin/projects`) — APIs exist, no UI

### Booking Gaps

- `PUT /api/bookings/[id]` — update booking
- `DELETE /api/bookings/[id]` — cancel booking
- `GET /api/availability/calendar` — month-view calendar

### Programs & Applications (not started)

All of Phase 5 from BACKEND_TODO is unimplemented:
- `GET/POST /api/programs`, `/api/programs/[id]`, `/api/programs/[id]/cohorts`, `/api/programs/[id]/apply`
- Full cohort and application CRUD (admin)
- Application status workflow: draft → submitted → under-review → approved / rejected / waitlisted

### Partner & Project Actions

- `GET /api/partners/[id]/opportunities` — not yet a standalone endpoint
- `POST /api/partners/[id]/opportunities` (admin)
- `POST /api/projects/[id]/follow`, `/volunteer`, `/collaborate`

### Infrastructure / Cross-Cutting

- **File storage:** No cloud upload implemented. `app/api/admin/news/upload-image/route.ts` is a TODO stub. Use Vercel Blob (`import { put } from '@vercel/blob'`).
- **Rate limiting:** Not implemented on auth or public endpoints.
- **RBAC middleware:** Admin role checking is not fully enforced in route handlers.
- **Audit logging:** `AuditLog` model not in schema; no admin mutation logging.
- **Health check endpoints:** `GET /api/health` not implemented.
- **Seed script:** No dev seed data for test users, events, etc.

### Suggested Order

1. **Billing** — fix `GET /api/billing` (ensure schema models migrated), then M-Pesa Daraja callback.
2. **Global search** — implement `GET /api/search`.
3. **Auth completeness** — logout, password reset, email verify.
4. **Admin UI** — billing, resources, partners, projects pages.
5. **Programs & Applications** — full Phase 5.
6. **File storage** — Vercel Blob for images and resource files.
7. **Rate limiting + security headers**.

---

## Feature Notes

### Notifications

The notification system is complete and production-ready.

**Auto-triggers:** booking confirmation fires automatically when a booking is created. Additional triggers (event reminders, payment alerts) can be added in the same pattern.

**Creating a notification (server-side):**
```typescript
import { createNotification, NotificationTemplates } from "@/lib/notifications"

await createNotification({
  userId: "user-id",
  ...NotificationTemplates.bookingConfirmed(bookingId, "hot desk", "Monday, Jan 1, 2024"),
})
```

**Fetching from client:**
```typescript
const res = await fetch("/api/notifications?limit=10&unreadOnly=true")
const { notifications, unreadCount } = await res.json()
```

**Available templates:** `bookingConfirmed`, `bookingCancelled`, `eventReminder`, `eventRegistration`, `newsPublished`, `paymentRequired`

**Bell badge behavior:** Only shown when `unreadCount > 0`; polls every 30 seconds.

**Future:** broadcast to all users, email/push/SMS delivery, notification preferences, WebSocket/SSE real-time updates.

### News

The news system has basic CRUD, draft/published status, search, and comments. Key improvements still needed:

**Priority 1 (high impact):**
- **Replace base64 images with cloud storage.** Base64 URLs bloat the DB and slow page loads. Use Vercel Blob:
  ```typescript
  import { put } from '@vercel/blob'
  const blob = await put(file.name, buffer, { access: 'public', addRandomSuffix: true })
  return NextResponse.json({ url: blob.url })
  ```
- **Categories and tags** — `Category` and `NewsTag` models exist in schema; `/api/categories` and `/api/tags` are live. Admin UI needs to expose them in the editor.
- **Author attribution** — `NewsPost.authorId` → `AdminUser` relation; display "By [Name]" in articles.

**Priority 2:**
- SEO fields: `slug` (unique), `metaTitle`, `metaDescription`, `ogImageUrl`. Use `generateMetadata()` in `[id]/page.tsx`.
- Featured/pinned posts: `isFeatured`, `isPinned`, `featuredOrder` fields.
- Reading time: calculate from word count at ~200 wpm; show "X min read".
- View tracking: `viewCount` increment on GET; `NewsPostView` table for analytics.

**Priority 3 (nice-to-have):**
- Related posts (by category/tags), social sharing buttons, content versioning (`NewsPostRevision`), scheduled publishing cron job, rich text editor (TipTap/Lexical), Redis caching for popular posts.

**Recommended DB indexes for news:**
```prisma
@@index([status, publishedAt])
@@index([categoryId])
@@index([isFeatured, publishedAt])
```
