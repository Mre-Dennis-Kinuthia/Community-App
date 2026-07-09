/**
 * Apply marketing-funnel schema changes without a full db push.
 * Safe to re-run (IF NOT EXISTS).
 *
 * Usage: npm run db:apply-marketing
 */
import { neon } from "@neondatabase/serverless"
import { config } from "dotenv"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
config({ path: resolve(root, ".env.local") })
config({ path: resolve(root, ".env") })

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL
if (!connectionString) {
  console.error("Set DATABASE_URL or DIRECT_URL in .env.local")
  process.exit(1)
}

const sql = neon(connectionString)

async function main() {
  await sql`
    ALTER TABLE "users"
    ADD COLUMN IF NOT EXISTS "onboarding_reminder_sent_at" TIMESTAMP(3)
  `

  await sql`
    ALTER TABLE "events"
    ADD COLUMN IF NOT EXISTS "featuredOnHomepage" BOOLEAN NOT NULL DEFAULT false
  `

  await sql`
    CREATE INDEX IF NOT EXISTS "events_featuredOnHomepage_idx"
    ON "events" ("featuredOnHomepage")
  `

  await sql`
    CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "source" TEXT NOT NULL DEFAULT 'landing',
      "unsubscribeToken" TEXT NOT NULL,
      "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "unsubscribedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
    )
  `

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_subscribers_email_key"
    ON "newsletter_subscribers" ("email")
  `

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_subscribers_unsubscribeToken_key"
    ON "newsletter_subscribers" ("unsubscribeToken")
  `

  await sql`
    CREATE INDEX IF NOT EXISTS "newsletter_subscribers_subscribedAt_idx"
    ON "newsletter_subscribers" ("subscribedAt")
  `

  console.log("[db:apply-marketing] Marketing schema is ready (newsletter, onboarding reminder, featured events)")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
