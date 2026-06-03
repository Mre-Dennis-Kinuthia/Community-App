/**
 * Create community_opportunities on Neon when migrate deploy is skipped on Vercel.
 *
 * Usage: npm run db:apply-community-opportunities
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
console.log(`[apply-community-opportunities] Connecting to ${host}`)

const sql = neon(connectionString)

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS "community_opportunities" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "summary" TEXT,
      "content" TEXT NOT NULL,
      "flierUrl" TEXT,
      "applyUrl" TEXT NOT NULL,
      "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "source" TEXT,
      "status" TEXT NOT NULL DEFAULT 'draft',
      "featured" BOOLEAN NOT NULL DEFAULT false,
      "deadline" TIMESTAMP(3),
      "publishedAt" TIMESTAMP(3),
      "notifiedAt" TIMESTAMP(3),
      "createdBy" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      "deletedAt" TIMESTAMP(3),
      CONSTRAINT "community_opportunities_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS "community_opportunities_status_idx" ON "community_opportunities"("status")`
  await sql`CREATE INDEX IF NOT EXISTS "community_opportunities_publishedAt_idx" ON "community_opportunities"("publishedAt")`
  await sql`CREATE INDEX IF NOT EXISTS "community_opportunities_deadline_idx" ON "community_opportunities"("deadline")`

  const rows = await sql`SELECT COUNT(*)::int AS n FROM "community_opportunities"`
  console.log("[apply-community-opportunities] Table ready. Row count:", rows[0]?.n ?? 0)
}

main().catch((err) => {
  console.error(
    "[apply-community-opportunities] Failed:",
    err instanceof Error ? err.message : err
  )
  process.exit(1)
})
