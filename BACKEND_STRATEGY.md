## Backend Strategy (Community Platform)

This document outlines the backend approach for the public Community App and its Admin App. The goal is a single shared backend that serves both frontends with consistent data, auth, and auditing.

### Tech Stack (decided)
| Layer        | Choice     | Purpose |
|-------------|------------|---------|
| **Database**| **Neon**   | Serverless Postgres; branchable DB, serverless driver, Vercel-native. |
| **Backend** | **Next.js**| API Route Handlers (`/app/api`) in the Community-App; replaces a standalone Node service. |
| **Hosting** | **Vercel** | Deploy Next.js; Edge/Serverless for API routes; integrates Neon + Auth.js. |
| **ORM**     | **Prisma** | Type-safe schema, migrations, and client for Neon. |
| **Auth**    | **Auth.js**| next-auth (Credentials, OAuth, JWT/session); shared for members + admin RBAC. |

The existing `backend/` (plain Node HTTP server) is a placeholder; the real backend will live as **Next.js API routes** in the Community-App frontend repo.

### Goals
- Single source of truth for members, content, events, bookings, and billing.
- Role-based access control for admin operations.
- Clear API contracts for the Next.js apps to consume.
- Safe evolution from mock data to production APIs.

### Architecture Overview
- **Next.js API routes** (Route Handlers in `/app/api`) as the backend for both Community and Admin apps.
- **Neon (PostgreSQL)** as the primary database; Prisma for schema, migrations, and queries.
- **Vercel** for deployment; serverless/edge for `/api` routes.
- **Auth.js** for member and admin auth; sessions via HTTP-only cookies.
- **Object storage** (S3-compatible, e.g. Vercel Blob or AWS) for media and files.
- **Queue/worker** (e.g. Vercel Cron, Inngest, or separate worker) for email, notifications, and scheduled publishing.
- **Audit logging** for admin actions and sensitive operations.

Deployment:
- **Phase 1:** Single Next.js app (Community-App) on Vercel with `/api`; Admin app calls these APIs (same or cross-origin).
- **Phase 2 (scale):** Split into dedicated API app or edge functions if needed; same Neon + Prisma.

### Auth and Sessions (Auth.js)
- **Member auth:** Auth.js Credentials (email/password) + optional magic link or OAuth.
- **Admin auth:** Auth.js with separate admin provider/table; RBAC in callbacks and API middleware.
- **Session:** Auth.js JWT or DB sessions; HTTP-only cookies; short-lived access, long-lived refresh.
- **Multi-factor auth:** optional for admins in a later phase.

Roles (Admin):
- super_admin, content_manager, community_manager, programs_manager, finance_ops.

### Core Data Model (Initial)
- Users (members)
- AdminUsers + Roles + RolePermissions
- Sessions / RefreshTokens
- MemberProfiles (skills, bio, location)
- NewsPosts (draft/scheduled/published)
- Events + EventRegistrations
- Resources (files/links) + ResourceTags
- Programs + Cohorts + Applications
- Projects + ProjectMembers
- Partners + Opportunities
- Bookings (rooms/desk) + Spaces
- Attendance / CheckIns
- Payments + Invoices + Subscriptions (if billing)
- Notifications + AuditLogs

### API Surface (v1)
Public app:
- `GET /public/news`, `GET /public/events`, `GET /public/resources`
- `GET /members/:id`, `GET /projects`, `GET /partners`
- `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`
- `POST /bookings`, `GET /bookings/me`
- `POST /events/:id/register`

Admin app:
- `GET /admin/dashboard/metrics`
- `CRUD /admin/news`, `CRUD /admin/events`, `CRUD /admin/resources`
- `CRUD /admin/members`, `CRUD /admin/projects`, `CRUD /admin/partners`
- `CRUD /admin/programs`, `CRUD /admin/cohorts`, `CRUD /admin/applications`
- `CRUD /admin/bookings`, `CRUD /admin/spaces`
- `CRUD /admin/payments` (if Stripe is integrated)
- `POST /admin/attendance/checkin`

### Security and Compliance
- Row-level access enforced in service layer.
- Soft deletes for content and members.
- Input validation and rate limiting on auth + public endpoints.
- Audit logs for all admin mutations.

### Integrations
- **Payments:** Stripe (subscriptions, invoices, refunds).
- **Email:** Resend/SendGrid for transactional email.
- **Calendars:** Google Calendar for event sync (optional).
- **QR Check-in:** short-lived token + scan endpoint.

### Migration Plan
1. **Phase 0 (now):** mock auth + placeholder data (current state).
2. **Phase 1:** real auth + news/events/resources + admin RBAC.
3. **Phase 2:** bookings + programs + attendance + payments.
4. **Phase 3:** analytics, notifications, and integrations.

### Next Steps
- **Neon:** Create project, get connection string; add `DATABASE_URL` to Vercel and `.env.local`.
- **Prisma:** Add Prisma to Community-App, define schema (Users, AdminUsers, Roles, NewsPosts, Events, etc.), run `prisma migrate` against Neon.
- **Auth.js:** Extend `auth.ts` to use Prisma Adapter (optional) or keep JWT with DB-backed user lookup; add admin provider/role checks.
- **API routes:** Implement `/app/api/...` Route Handlers for public and admin surfaces; use `auth()` and Prisma in each.
- **Vercel:** Connect repo, set env vars (`DATABASE_URL`, `AUTH_SECRET`, etc.), deploy.
- **Deprecate:** `backend/` placeholder once `/api` health and core endpoints exist.
