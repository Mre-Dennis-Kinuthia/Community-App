/**
 * Create / upgrade email_templates for editable + linkable templates.
 *
 * Usage: npm run db:apply-email-templates
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

const host = connectionString.match(/@([^/]+)/)?.[1] ?? "unknown"
console.log(`[apply-email-templates] Connecting to ${host}`)

const sql = neon(connectionString)

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS "email_templates" (
      "id" TEXT NOT NULL,
      "key" TEXT NOT NULL,
      "slot" TEXT NOT NULL DEFAULT '',
      "name" TEXT NOT NULL,
      "description" TEXT,
      "category" TEXT NOT NULL,
      "subject" TEXT NOT NULL,
      "preheader" TEXT,
      "title" TEXT NOT NULL,
      "eyebrow" TEXT,
      "bodyHtml" TEXT NOT NULL,
      "ctaLabel" TEXT,
      "textBody" TEXT NOT NULL,
      "enabled" BOOLEAN NOT NULL DEFAULT true,
      "isActive" BOOLEAN NOT NULL DEFAULT false,
      "isSystem" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
    )
  `

  // Upgrade existing installs
  await sql`ALTER TABLE "email_templates" ADD COLUMN IF NOT EXISTS "slot" TEXT`
  await sql`ALTER TABLE "email_templates" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT false`
  await sql`ALTER TABLE "email_templates" ADD COLUMN IF NOT EXISTS "isSystem" BOOLEAN NOT NULL DEFAULT false`

  // Backfill slot from key for legacy rows
  await sql`UPDATE "email_templates" SET "slot" = "key" WHERE "slot" IS NULL OR "slot" = ''`
  await sql`ALTER TABLE "email_templates" ALTER COLUMN "slot" SET NOT NULL`
  await sql`ALTER TABLE "email_templates" ALTER COLUMN "slot" SET DEFAULT ''`

  // Mark seeded/system rows (key == slot) and activate one per slot if none active
  await sql`UPDATE "email_templates" SET "isSystem" = true WHERE "key" = "slot"`
  await sql`
    UPDATE "email_templates" AS t
    SET "isActive" = true
    WHERE t."key" = t."slot"
      AND NOT EXISTS (
        SELECT 1 FROM "email_templates" AS o
        WHERE o."slot" = t."slot" AND o."isActive" = true
      )
  `

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "email_templates_key_key" ON "email_templates"("key")`
  await sql`CREATE INDEX IF NOT EXISTS "email_templates_category_idx" ON "email_templates"("category")`
  await sql`CREATE INDEX IF NOT EXISTS "email_templates_slot_idx" ON "email_templates"("slot")`
  await sql`CREATE INDEX IF NOT EXISTS "email_templates_slot_isActive_idx" ON "email_templates"("slot", "isActive")`

  const rows = await sql`SELECT COUNT(*)::int AS n FROM "email_templates"`
  console.log("[apply-email-templates] Table ready. Row count:", rows[0]?.n ?? 0)
}

main().catch((err) => {
  console.error(
    "[apply-email-templates] Failed:",
    err instanceof Error ? err.message : err
  )
  process.exit(1)
})
