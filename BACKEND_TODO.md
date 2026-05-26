## Backend TODO (Community-App)

This file is the running backlog for backend/API work. The Community App backend is implemented as Next.js route handlers under `frontend/app/api`.

### Phase 5 — Programs & Applications (not started)

- **Models**
  - `Program`, `Cohort`, `Application`
  - Application status workflow: draft → submitted → under-review → approved / rejected / waitlisted
- **Member APIs**
  - `GET /api/programs`
  - `GET /api/programs/[id]`
  - `GET /api/programs/[id]/cohorts`
  - `POST /api/programs/[id]/apply`
- **Admin APIs**
  - `POST /api/admin/programs`
  - `PUT /api/admin/programs/[id]`
  - `DELETE /api/admin/programs/[id]`
  - Cohort CRUD under `/api/admin/programs/[id]/cohorts`
  - Application review workflow under `/api/admin/applications`

### Other gaps (follow-up)

- **Billing**
  - Stripe integration + webhooks
  - M-Pesa callback handler + persistence
- **Bookings**
  - Update/cancel booking endpoints
  - Calendar-style availability endpoint
- **File storage**
  - Replace base64/stub uploads with a real provider (Vercel Blob or S3)

