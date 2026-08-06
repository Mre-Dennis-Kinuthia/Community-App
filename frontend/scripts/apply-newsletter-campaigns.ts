/**
 * Apply newsletter campaign tables via Neon serverless driver.
 * Usage: npx tsx --env-file=.env.local scripts/apply-newsletter-campaigns.ts
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

async function trySql(label: string, fn: () => Promise<unknown>) {
  try {
    await fn()
    console.log(`  ok: ${label}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/already exists|duplicate/i.test(message)) {
      console.log(`  skip: ${label} (${message.split("\n")[0]})`)
      return
    }
    throw error
  }
}

async function main() {
  console.log("[apply-newsletter-campaigns] Applying…")

  await trySql("newsletter_campaigns table", () => sql`
    CREATE TABLE IF NOT EXISTS "newsletter_campaigns" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "subject" TEXT NOT NULL,
      "preheader" TEXT,
      "sections" JSONB NOT NULL DEFAULT '[]',
      "brandPrimary" TEXT,
      "brandAccent" TEXT,
      "status" TEXT NOT NULL DEFAULT 'draft',
      "audience" TEXT NOT NULL DEFAULT 'subscribers',
      "scheduledAt" TIMESTAMP(3),
      "sentAt" TIMESTAMP(3),
      "publishedToWeb" BOOLEAN NOT NULL DEFAULT true,
      "authorId" TEXT,
      "sentCount" INTEGER NOT NULL DEFAULT 0,
      "openCount" INTEGER NOT NULL DEFAULT 0,
      "clickCount" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "deletedAt" TIMESTAMP(3),
      CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
    )
  `)

  await trySql("campaign slug unique", () =>
    sql`CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_campaigns_slug_key" ON "newsletter_campaigns"("slug")`
  )
  await trySql("campaign status idx", () =>
    sql`CREATE INDEX IF NOT EXISTS "newsletter_campaigns_status_idx" ON "newsletter_campaigns"("status")`
  )
  await trySql("campaign scheduledAt idx", () =>
    sql`CREATE INDEX IF NOT EXISTS "newsletter_campaigns_scheduledAt_idx" ON "newsletter_campaigns"("scheduledAt")`
  )
  await trySql("campaign sentAt idx", () =>
    sql`CREATE INDEX IF NOT EXISTS "newsletter_campaigns_sentAt_idx" ON "newsletter_campaigns"("sentAt")`
  )
  await trySql("campaign publishedToWeb idx", () =>
    sql`CREATE INDEX IF NOT EXISTS "newsletter_campaigns_publishedToWeb_idx" ON "newsletter_campaigns"("publishedToWeb")`
  )
  await trySql("campaign author FK", () => sql`
    ALTER TABLE "newsletter_campaigns"
      ADD CONSTRAINT "newsletter_campaigns_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "admin_users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE
  `)

  await trySql("newsletter_sends table", () => sql`
    CREATE TABLE IF NOT EXISTS "newsletter_sends" (
      "id" TEXT NOT NULL,
      "campaignId" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "userId" TEXT,
      "subscriberId" TEXT,
      "trackingToken" TEXT NOT NULL,
      "sentAt" TIMESTAMP(3),
      "openedAt" TIMESTAMP(3),
      "clickCount" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "newsletter_sends_pkey" PRIMARY KEY ("id")
    )
  `)

  await trySql("sends tracking unique", () =>
    sql`CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_sends_trackingToken_key" ON "newsletter_sends"("trackingToken")`
  )
  await trySql("sends campaign+email unique", () =>
    sql`CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_sends_campaignId_email_key" ON "newsletter_sends"("campaignId", "email")`
  )
  await trySql("sends campaignId idx", () =>
    sql`CREATE INDEX IF NOT EXISTS "newsletter_sends_campaignId_idx" ON "newsletter_sends"("campaignId")`
  )
  await trySql("sends tracking idx", () =>
    sql`CREATE INDEX IF NOT EXISTS "newsletter_sends_trackingToken_idx" ON "newsletter_sends"("trackingToken")`
  )
  await trySql("sends campaign FK", () => sql`
    ALTER TABLE "newsletter_sends"
      ADD CONSTRAINT "newsletter_sends_campaignId_fkey"
      FOREIGN KEY ("campaignId") REFERENCES "newsletter_campaigns"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  `)
  await trySql("sends subscriber FK", () => sql`
    ALTER TABLE "newsletter_sends"
      ADD CONSTRAINT "newsletter_sends_subscriberId_fkey"
      FOREIGN KEY ("subscriberId") REFERENCES "newsletter_subscribers"("id")
      ON DELETE SET NULL ON UPDATE CASCADE
  `)

  await trySql("newsletter_events table", () => sql`
    CREATE TABLE IF NOT EXISTS "newsletter_events" (
      "id" TEXT NOT NULL,
      "sendId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "url" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "newsletter_events_pkey" PRIMARY KEY ("id")
    )
  `)
  await trySql("events sendId idx", () =>
    sql`CREATE INDEX IF NOT EXISTS "newsletter_events_sendId_idx" ON "newsletter_events"("sendId")`
  )
  await trySql("events type idx", () =>
    sql`CREATE INDEX IF NOT EXISTS "newsletter_events_type_idx" ON "newsletter_events"("type")`
  )
  await trySql("events send FK", () => sql`
    ALTER TABLE "newsletter_events"
      ADD CONSTRAINT "newsletter_events_sendId_fkey"
      FOREIGN KEY ("sendId") REFERENCES "newsletter_sends"("id")
      ON DELETE CASCADE ON UPDATE CASCADE
  `)

  console.log("[apply-newsletter-campaigns] Done")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
