## V0 Prompt: Admin Platform for Impact Hub Nairobi Community Platform

You are designing and implementing an **admin platform** for the existing Impact Hub Nairobi **Community Platform** (built with Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui).  
This admin app will be used by Impact Hub Nairobi staff to manage **all content, operations, and configuration** of the public community platform.

Build a **production-ready, responsive, secure admin interface** that matches Impact Hub Nairobi’s branding (deep red primary, dark gray neutrals, clean minimal style) and is designed for **daily operational use**.

### 1. Technical & Design Requirements

- **Tech stack alignment**
  - Use: **Next.js 13+ App Router**, **TypeScript**, **React**, **Tailwind CSS**, and **shadcn/ui** (or a very similar React + Tailwind component library).
  - Structure the project in a way that it can live alongside, or integrate cleanly with, the existing community platform (shared components/themes where possible).
  - Support dark mode if easy, but prioritize clarity and usability over visual gimmicks.

- **Branding & UI**
  - Match **Impact Hub Nairobi** branding:
    - Primary: deep red (as already used on the main platform).
    - Secondary / background: dark gray and light neutral tones.
    - Accent colors used sparingly for status (success, warning, info, danger).
  - Use a **clean, “Apple-like” admin look**:
    - Clear typography hierarchy.
    - Subtle card shadows, rounded corners.
    - Consistent spacing and grids.
  - Prioritize **readability and quick scanning**: tables, filters, and dashboards should be easy to parse at a glance.

- **General UX principles**
  - All list views should support:
    - Search (by key fields),
    - Filtering (by status, date, type, etc.),
    - Sorting (by created date, updated date, name, etc.),
    - Pagination (or infinite scroll if justified).
  - All detail views should support:
    - View, create, edit, archive/delete (soft delete preferred) with confirmation modals.
    - Audit info: created by, created at, last updated by, last updated at.
  - Use **modals and slide-overs (sheets)** where appropriate for quick edits, but allow full-page forms for complex entities.
  - Include **form validation** (client-side at minimum) with clear error messages.

### 2. Authentication, Authorization & Roles

Design the admin platform assuming **role-based access control**:

- **Admin roles**
  - **Super Admin**  
    - Full access to all modules, settings, and data (including financials, user roles, and platform-wide configuration).
  - **Content Manager**  
    - Manage blogs, news, events, resources, and media assets.
  - **Community Manager**  
    - Manage members, community profiles, projects, partnerships, and community interactions.
  - **Programs & Events Manager**  
    - Manage programs, cohorts, applications, event listings, registrations, and attendance.
  - **Finance / Operations**  
    - Manage payments, invoices, subscription plans, refunds, and basic financial reports.

In the UI:
- Provide a **role-based navigation** where users only see modules they can access.
- Include a **profile area** showing the admin’s name, role, and quick links (profile, change password, sign out).

### 3. Global Admin Layout & Navigation

Create a **global admin shell**:

- **Left sidebar navigation** (collapsible on small screens) with sections:
  - Dashboard
  - Content
    - News & Blogs
    - Events
    - Resources
  - Community
    - Members
    - Projects & Initiatives
    - Community Profiles (Innovation Community)
  - Programs
    - Programs & Cohorts
    - Applications & Selection
    - Check-ins & Attendance
  - Partners & Network
    - Partners
    - Opportunities / Collaborations
  - Operations
    - Payments & Billing
    - Membership & Plans
    - Hub Management (spaces, rooms, capacity)
  - Settings & Admin
    - Platform Settings
    - Branding & Content Blocks
    - Admin Users & Roles

- **Top bar**
  - Quick search (global search across entities).
  - Notifications (e.g., new applications, failed payments, upcoming events).
  - Profile dropdown (My account, Settings, Logout).

### 4. Dashboard Overview

Design a **high-level dashboard** landing page for admins:

- **Key metrics cards**:
  - Total members, active this month.
  - Number of ventures/projects.
  - Active programs and open applications.
  - Upcoming events this week.
  - Recent check-ins (today).
  - Recent payments (today/this week) and total revenue this month (if payments are integrated).

- **Recent activity feed**:
  - New member signups.
  - New projects or updates.
  - Newly published news/blog posts.
  - Latest event registrations.
  - Payment events (successful charge, failed charge, refund).

- **Quick actions**:
  - Create new event.
  - Publish news/blog.
  - Add a new program or cohort.
  - Invite a new member.

### 5. Content Management (Blogs, News, Resources, Events)

The public platform already has **News**, **Events**, and **Resources**.  
Admin should fully control these:

#### 5.1 News & Blogs

- **List view**
  - Columns: Title, Category/Tag, Status (Draft, Scheduled, Published, Archived), Author, Published date, Last updated.
  - Filters: status, category, publish date range, author.
  - Actions per row: View, Edit, Duplicate, Archive.

- **Create / Edit form**
  - Fields: Title, Slug (auto-generated but editable), Summary/Excerpt, Body (rich text editor / markdown editor), Cover image, Category, Tags, Featured toggle (show on homepage/landing).
  - Publishing options:
    - Draft, Publish now, Schedule publish (date & time).
    - Unpublish / archive.
  - SEO options:
    - Meta title, Meta description, Open Graph image.

#### 5.2 Events

- **List view**
  - Columns: Title, Type (workshop, meetup, program event, etc.), Location (physical/online/hybrid), Start date, End date, Status (Draft, Published, Completed, Cancelled), Registrations count.
  - Filters: type, status, date, location mode, program association.

- **Create / Edit form**
  - Core details: Title, Slug, Description (rich text), Event type, Category, Associated Program (optional).
  - Logistics: Start/end date & time, Timezone, Location details (address, online link), Capacity.
  - Registration:
    - Enable/disable registration.
    - Registration form fields configuration (name, email, company, role, etc.).
    - Max seats, waitlist toggle.
  - Visibility & publishing:
    - Draft/published.
    - Featured on Events page / homepage.

- **Registrations management**
  - For each event:
    - List: name, email, organization, status (registered, confirmed, attended, no-show).
    - Export to CSV.
    - Manually add/remove/confirm attendees.

#### 5.3 Resources (Programs & Resources page)

- **Resource library items**
  - Types: Article, PDF, Video, Toolkit, External link, Template, etc.
  - List view with filters by type, topic, and program association.
  - Fields: Title, Description, Type, Tags, Associated Programs, File/URL, Visibility (public, members-only, specific cohort).

### 6. Community & Members Administration

The public platform includes **Community**, **Projects & Initiatives**, and member profiles. Admin should be able to manage all of this.

#### 6.1 Members

- **List view**
  - Columns: Name, Email, Role (entrepreneur, investor, mentor, etc.), Location, Status (active, pending, suspended), Date joined.
  - Filters: role, status, location, skills, membership plan.

- **Member detail view**
  - Profile info: name, contact, role, bio, skills, interests, location, links (website, LinkedIn, etc.).
  - Membership info: current plan, renewal date, payment status (if integrated), check-in history.
  - Activity summary: projects they own/contribute to, events attended, programs joined, resources engaged with.
  - Admin controls:
    - Edit profile fields.
    - Change membership plan and status.
    - Impersonate user (optional, for support).
    - Suspend / reactivate account.

#### 6.2 Projects & Initiatives

- **List view**
  - Columns: Project name, Lead member, Stage (idea, MVP, scaling, etc.), Needs (funding, collaborators, volunteers), Followers, Status (active, archived).
  - Filters: stage, needs, location, sector/category.

- **Project detail view**
  - Core info: title, description, sector, location.
  - Team members and roles.
  - Needs and opportunities (e.g., seeking funding, collaborators, volunteers, partners).
  - Timeline / milestones.
  - Engagement metrics: followers, volunteers, applications.
  - Admin actions: edit, feature on homepage, archive, moderate content (if user-generated).

### 7. Programs & Check-ins

The platform distributes **programs** and **resources**. Admin must manage program lifecycles and check-in processes.

#### 7.1 Programs & Cohorts

- **Programs list**
  - Columns: Name, Type (accelerator, incubator, fellowship, etc.), Status (upcoming, active, completed), Cohorts count, Applications open/closed.
  - Filters: type, status, year.

- **Program detail**
  - Program overview: description, goals, eligibility, benefits.
  - Cohorts:
    - Each cohort with name, start/end dates, current phase, number of participants.
  - Application settings:
    - Application open/close dates, form configuration, capacity, selection criteria (basic).

#### 7.2 Applications & Selection

- **Applications list**
  - Filter by program, cohort, status (new, in-review, shortlisted, accepted, rejected).
  - Show applicant details (person / venture / project).

- **Application detail**
  - Full application answers.
  - Evaluation tab: scores, comments from reviewers, decision status.
  - Actions: move between states, accept, reject, waitlist, export.

#### 7.3 Check-ins & Attendance

- For both **workspace usage** and **event/program sessions**, support:

- **Check-in management module**
  - Ability to generate per-event or per-session check-in lists.
  - Admin UI to:
    - Mark attendance (present/absent/late),
    - Search a person and mark as checked-in.
  - Option to integrate QR-based or code-based check-in (design schema and basic UI, even if backend integration is mocked).

- **Views**
  - For a member: show personal attendance history.
  - For an event/program: show who attended, attendance rate, exportable data.

### 8. Partners, Network & Opportunities

The public platform showcases **Partners** and network opportunities.

- **Partners**
  - List view: Partner name, Type (e.g., corporate, foundation, ecosystem partner), Category (workspace, funding, knowledge, etc.), Status (active, inactive), Visibility (featured on homepage or not).
  - Detail view:
    - Logo, name, description, website, contact person, partnership type.
    - Associated opportunities (calls, grants, joint programs).
    - Visibility toggles for landing page sections like “Platform Partners”.

- **Opportunities / Collaborations**
  - Represent grants, calls for applications, investment opportunities, etc.
  - Fields: title, description, partner, deadline, tags, eligibility, URL or application link.
  - Admin can feature selected opportunities on public pages.

### 9. Payments, Membership & Hub Management

Admin platform should support **basic payment and hub management flows** (even if the payment gateway integration is abstracted).

#### 9.1 Payments & Billing

- **Transactions list**
  - Columns: Member, Amount, Currency, Type (membership, event fee, program fee, other), Status (succeeded, pending, failed, refunded), Date.
  - Filters: date range, type, status, member, program/event.

- **Transaction detail**
  - Raw payment info (transaction ID, gateway response fields as appropriate).
  - Links to related member, membership, or event/program.

- **Invoices / Receipts**
  - Ability to view and resend receipts (email).
  - Optional: download PDF invoices (design structure even if PDF generation is not implemented).

#### 9.2 Membership Plans

- Manage membership tiers used on the platform:
  - Fields: name, description, monthly/annual price, included benefits, max check-ins or workspace usage, eligibility.
  - Toggle visibility (active/inactive).

#### 9.3 Hub Management (Spaces & Rooms)

- Represent Impact Hub Nairobi physical spaces:
  - Spaces: main hub, floors, areas.
  - Rooms: meeting rooms, event spaces, focus rooms, etc.
  - Fields: name, capacity, available resources (projector, whiteboard, etc.), booking rules.
  - Option to mark a space as “available for booking” vs “internal use”.

### 10. Settings & Configuration

- **Platform settings**
  - Branding: title, tagline, primary color overrides, logo uploads (light/dark), favicon upload (if applicable).
  - Landing page content blocks:
    - Hero texts, badge texts, metrics (e.g., “500+ members”, “KES 50M+ facilitated”).
    - Platform Partners content and ordering.

- **Email & notifications**
  - Templates for system emails (welcome, password reset, event reminders, program application notifications, payment receipts).
  - Toggles for which notifications are sent automatically.

- **Admin users & roles**
  - CRUD for admin accounts, with role assignment (Super Admin, Content Manager, etc.).
  - Activity log for admin actions (audit trail).

### 11. Data Model & Integration Notes

When designing UI and data models, assume alignment with the existing community platform entities:

- Members  
- Community profiles (from the Innovation Community section)  
- Projects & initiatives  
- Events & event registrations  
- Programs, cohorts, applications  
- Resources, news/blog posts  
- Partners and opportunities  
- Payments, memberships, and hub spaces  

The admin platform should expose clear types/interfaces for these entities to make future integration with APIs straightforward.

### 12. Non-Functional Requirements

- **Responsiveness**: Works smoothly on desktop and tablet, minimally acceptable on mobile.
- **Accessibility**: Use semantic markup, proper labels, and sufficient color contrast.
- **Performance**: Avoid unnecessary re-renders; use pagination and lazy-loading where appropriate.
- **Extensibility**: Keep the structure modular so new modules (e.g., surveys, impact reporting) can be added later.

---

Using the above specification, **design and implement the full admin platform UI** (pages, navigation, layout, forms, tables, and states) with realistic placeholder data and clear separation of concerns, so it can be wired to real backend APIs later with minimal refactoring.

