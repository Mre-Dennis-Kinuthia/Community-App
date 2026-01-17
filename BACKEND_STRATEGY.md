## Backend Strategy (Community Platform)

This document outlines the backend approach for the public Community App and its Admin App. The goal is a single shared backend that serves both frontends with consistent data, auth, and auditing.

### Goals
- Single source of truth for members, content, events, bookings, and billing.
- Role-based access control for admin operations.
- Clear API contracts for the Next.js apps to consume.
- Safe evolution from mock data to production APIs.

### Architecture Overview
- **Standalone backend service** for both apps, exposed via REST (or REST + limited GraphQL if needed).
- **PostgreSQL** as the primary database.
- **Object storage** (S3-compatible) for media and files.
- **Queue/worker** for email, notifications, and scheduled publishing.
- **Audit logging** for admin actions and sensitive operations.

Recommended deployment paths:
- **Phase 1 (now):** Separate API service (e.g., NestJS/Express) with the same DB.
- **Phase 2 (scale):** Split workloads into public + admin services if needed.

### Auth and Sessions
- **Member auth:** email/password + optional magic link or OAuth.
- **Admin auth:** separate admin table with RBAC.
- **Session handling:** HTTP-only cookies + short-lived access, long-lived refresh.
- **Multi-factor auth:** optional for admins in later phase.

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
- Confirm backend framework (Express/Nest/Fastify).
- Confirm identity provider approach (Auth.js vs custom).
- Lock initial data model and start Prisma schema.
