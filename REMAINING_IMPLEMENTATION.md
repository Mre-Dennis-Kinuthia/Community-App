# Remaining Implementation – Community Platform

Summary of what is still to implement or improve, based on the codebase and docs.

---

## 1. Payments & Billing

| Item | Status | Notes |
|------|--------|------|
| **M-Pesa (Safaricom Daraja)** | Not integrated | STK push and payment flow work without DB; real M-Pesa needs Daraja API (STK push, callbacks, env vars). |
| **Payment model** | Missing in schema | Optional: add `Payment` and persist M-Pesa payments. |
| **Billing GET `/api/billing`** | Will 500 if used | Uses `Subscription`, `Plan`, `PaymentMethod`, `Invoice` – these models are **not** in `schema.prisma`. Either add them (see SCHEMA_ADDITIONS.md) or change the route to avoid Prisma for now. |

---

## 2. Global Search

| Item | Status | Notes |
|------|--------|------|
| **Search API** | Not implemented | `components/global-search.tsx` has TODO; no `/api/search`. Options: new `/api/search` that queries events, members, projects, partners, resources, news – or call existing list APIs and merge. |

---

## 3. Data Still Static or Placeholder

| Item | Location | Notes |
|------|----------|------|
| **Pricing** | `lib/hooks/use-pricing.ts` | Returns static/mock pricing. TODO: replace with API (e.g. `/api/workspace/pricing` or from workspace API). |
| **Reviews** | `lib/hooks/use-reviews.ts` | Returns mock data. TODO: replace with API if reviews feature is required. |
| **Community industries/roles filters** | `app/community/page.tsx` | Industries/roles lists are hardcoded "All". Can be driven by MemberProfile data when needed. |
| **Project name on member profile** | `app/community/[id]/page.tsx` | TODO: fetch project name from API for project links. |
| **Program detail fallbacks** | `app/resources/programs/[id]/page.tsx` | Uses placeholder thumbnail/avatar when program not found. |

---

## 4. Auth / Social Login

| Item | Status | Notes |
|------|--------|------|
| **Google OAuth** | May be configured | Code exists; ensure NextAuth Google provider and env vars are set in production. |
| **LinkedIn OAuth** | Placeholder | Login/register show “coming soon”. Add provider in NextAuth if needed. |

---

## 5. Schema & Backend Gaps

| Item | Status | Notes |
|------|--------|------|
| **Partner model** | Done | Expanded with `type`, `category`, `description`, `logoUrl`, `website`, `location`, `locationType`, `focus[]`, `contactEmail`, `isFeatured`; relation to `PartnerOpportunity`. APIs return real data. |
| **PartnerOpportunity** | Done | Model added; relation to Partner. Partner detail API includes opportunities. |
| **Billing models** | Done | `Plan`, `Subscription`, `Payment`, `PaymentMethod`, `Invoice` added to schema. User relations added. GET `/api/billing` and M-Pesa (Payment create) use them. |
| **Project relations** | Done | `ProjectFollow`, `ProjectVolunteer`, `ProjectCollaboration` added; Project expanded with `category`, `stage`, `founderId`, `location`, `needs`, `website`, `socialLinks`, `launchDate`, `isFeatured`, etc. |

---

## 6. Admin Platform (Community-app-admin)

| Item | Status | Notes |
|------|--------|------|
| **Billing admin UI** | Not done | APIs may exist; add admin pages for subscriptions, plans, payments, invoices. |
| **Resources admin UI** | Not done | CRUD UI for resources (list, create, edit, delete, upload). |
| **Partners admin UI** | Not done | CRUD UI for partners and opportunities. |
| **Projects admin UI** | Not done | CRUD UI for projects. |
| **News image upload** | Placeholder | `app/api/admin/news/upload-image/route.ts`: TODO – upload to cloud storage and return URL. |

---

## 7. Optional / Nice-to-Have

- **Dashboard stats** – Already wired to `/api/dashboard/stats`; ensure that API returns the metrics you want.
- **File storage** – Profile images, news images, resource files: decide storage (e.g. S3, Cloudinary) and implement upload/URL in APIs.
- **Project follow/volunteer/collaboration** – `POST /api/projects/[id]/follow`, volunteer, collaborate if you want those actions.
- **Partner opportunities API** – `GET/POST /api/partners/[id]/opportunities` if partner opportunities are a feature.

---

## 8. Already Done (No Action Needed)

- Community directory, profiles, connections, follow – APIs and frontend connected.
- Bookings – Create, list, upcoming; payment step before confirm; success page.
- Events – List, filters, registration.
- News – List, post detail, comments.
- Notifications – List, unread count, mark read, delete; bell badge from real data.
- Partners & Projects & Resources – Frontend uses APIs; Partner/Project/Resource models exist (Partner minimal; APIs adapt).
- Navbar notification bubble – Only when unread count > 0; count from API.
- Sidebar – Mock “News” badge removed; no fake counts.

---

## Suggested order of work

1. **Billing**: Add Subscription, Plan, PaymentMethod, Invoice (and optionally Payment) to schema + migrate; fix GET `/api/billing` so it doesn’t 500. Then optionally integrate M-Pesa Daraja.
2. **Global search**: Implement `/api/search` (or aggregate existing APIs) and connect global-search UI.
3. **Pricing**: Replace static pricing with an API if pricing should be dynamic.
4. **Admin UI**: Add admin pages for Billing, Resources, Partners, Projects as needed.
5. **Partner schema**: Extend Partner (and add PartnerOpportunity) if you want full partner data and opportunities.
6. **News image upload**: Implement cloud upload in admin news upload route.

Use this as the single “remaining implementation” checklist; update the file as you complete items.
