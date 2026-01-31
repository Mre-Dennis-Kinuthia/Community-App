# Schema update: Partner, Billing, Project relations

The Prisma schema has been updated with:

- **Partner**: `type`, `category`, `description`, `logoUrl`, `website`, `location`, `locationType`, `focus[]`, `contactEmail`, `isFeatured`; relation to `PartnerOpportunity`.
- **PartnerOpportunity**: New model linked to Partner (title, description, category, amount, deadline, eligibility, applicationProcess, status).
- **Billing**: `Plan`, `Subscription`, `Payment`, `PaymentMethod`, `Invoice`; User relations for subscriptions, payments, paymentMethods, invoices.
- **Project**: `category`, `stage`, `impact`, `metrics`, `tags`, `founderId`, `location`, `needs[]`, `website`, `socialLinks`, `launchDate`, `isFeatured`; relations to `ProjectFollow`, `ProjectVolunteer`, `ProjectCollaboration`.
- **ProjectFollow**, **ProjectVolunteer**, **ProjectCollaboration**: New models linking User and Project.

## Apply the changes

From the frontend directory:

```bash
npx prisma migrate dev --name add_partner_billing_project_relations
npx prisma generate
```

This will:

1. Create new tables: `plans`, `subscriptions`, `payments`, `payment_methods`, `invoices`, `partner_opportunities`, `project_follows`, `project_volunteers`, `project_collaborations`.
2. Add new columns to `partners` and `projects` (existing rows get `NULL` or defaults where applicable).

If you use a shared DB or deploy pipeline, run the same migration there (e.g. `npx prisma migrate deploy` in production).

## Optional: backfill Partner

Existing partners only have `name`, `logoUrl`, `website`. New columns (`type`, `category`, `description`, `focus`, `locationType`, etc.) are optional. You can backfill via admin or SQL, e.g.:

```sql
UPDATE partners SET type = 'Partner', category = '', "locationType" = '' WHERE type IS NULL;
```

## Optional: backfill Project founder

`Project.founderId` is optional. To set founders for existing projects, update via admin or SQL when you have the mapping.
