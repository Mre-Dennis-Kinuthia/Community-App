/**
 * Create email_templates on Neon when migrate deploy is skipped on Vercel.
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
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "email_templates_key_key" ON "email_templates"("key")`
  await sql`CREATE INDEX IF NOT EXISTS "email_templates_category_idx" ON "email_templates"("category")`

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
