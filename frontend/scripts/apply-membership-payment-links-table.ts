/**
 * Apply membership_payment_links via Neon serverless driver (WebSocket/HTTP).
 * Use when `prisma migrate deploy` fails with P1001 from WSL.
 *
 * Usage: npm run db:apply-membership-links
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
console.log(`[apply-membership-links] Connecting to ${host}`)

const sql = neon(connectionString)

async function tryConstraint(name: string, statement: string) {
  try {
    await sql.query(statement)
    console.log(`[apply-membership-links] OK: ${name}`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("already exists") || msg.includes("duplicate")) {
      console.log(`[apply-membership-links] Skip (exists): ${name}`)
      return
    }
    throw err
  }
}

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS "membership_payment_links" (
      "id" TEXT NOT NULL,
      "token" TEXT NOT NULL,
      "planId" TEXT NOT NULL,
      "recipientEmail" TEXT NOT NULL,
      "recipientName" TEXT,
      "userId" TEXT,
      "amount" DECIMAL(12,2) NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'KES',
      "status" TEXT NOT NULL DEFAULT 'pending',
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "paidAt" TIMESTAMP(3),
      "paymentId" TEXT,
      "subscriptionId" TEXT,
      "createdByAdminId" TEXT,
      "adminNote" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "membership_payment_links_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "membership_payment_links_token_key" ON "membership_payment_links"("token")`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "membership_payment_links_paymentId_key" ON "membership_payment_links"("paymentId")`
  await sql`CREATE INDEX IF NOT EXISTS "membership_payment_links_status_idx" ON "membership_payment_links"("status")`
  await sql`CREATE INDEX IF NOT EXISTS "membership_payment_links_recipientEmail_idx" ON "membership_payment_links"("recipientEmail")`
  await sql`CREATE INDEX IF NOT EXISTS "membership_payment_links_expiresAt_idx" ON "membership_payment_links"("expiresAt")`

  await tryConstraint(
    "planId_fkey",
    `ALTER TABLE "membership_payment_links" ADD CONSTRAINT "membership_payment_links_planId_fkey"
      FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE`
  )
  await tryConstraint(
    "userId_fkey",
    `ALTER TABLE "membership_payment_links" ADD CONSTRAINT "membership_payment_links_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`
  )
  await tryConstraint(
    "paymentId_fkey",
    `ALTER TABLE "membership_payment_links" ADD CONSTRAINT "membership_payment_links_paymentId_fkey"
      FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE`
  )
  await tryConstraint(
    "subscriptionId_fkey",
    `ALTER TABLE "membership_payment_links" ADD CONSTRAINT "membership_payment_links_subscriptionId_fkey"
      FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE`
  )

  const rows = await sql`SELECT COUNT(*)::int AS n FROM "membership_payment_links"`
  console.log("[apply-membership-links] Table ready. Row count:", rows[0]?.n ?? 0)

  const migrationName = "20260603120000_membership_payment_links"
  const existing = await sql`
    SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = ${migrationName} LIMIT 1
  `
  if (!existing.length) {
    await sql`
      INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
      VALUES (
        gen_random_uuid()::text,
        '',
        NOW(),
        ${migrationName},
        NULL,
        NULL,
        NOW(),
        1
      )
    `
    console.log("[apply-membership-links] Recorded migration in _prisma_migrations")
  }

  console.log("[apply-membership-links] Membership payment links are ready.")
}

main().catch((err) => {
  console.error("[apply-membership-links] Failed:", err instanceof Error ? err.message : err)
  process.exit(1)
})
