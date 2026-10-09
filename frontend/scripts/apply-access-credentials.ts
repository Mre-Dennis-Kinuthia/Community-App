/**
 * Apply Hikvision badge / access-control outbox tables.
 * Usage: npx tsx --env-file=.env.local scripts/apply-access-credentials.ts
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

async function trySql(query: TemplateStringsArray, ...values: unknown[]) {
  try {
    await sql(query, ...values)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("already exists") || msg.includes("duplicate")) return
    throw err
  }
}

async function main() {
  await trySql`CREATE TYPE "AccessCredentialStatus" AS ENUM ('pending', 'active', 'revoked')`
  await trySql`CREATE TYPE "AccessSyncAction" AS ENUM ('upsert_user', 'grant_card', 'revoke_card')`
  await trySql`CREATE TYPE "AccessSyncJobStatus" AS ENUM ('pending', 'processing', 'done', 'failed')`

  await sql`
    ALTER TABLE "access_control_integrations"
    ADD COLUMN IF NOT EXISTS "bridge_last_seen_at" TIMESTAMP(3)
  `

  await sql`
    CREATE TABLE IF NOT EXISTS "access_credentials" (
      "id" TEXT NOT NULL,
      "user_id" TEXT,
      "visitor_id" TEXT,
      "card_no" TEXT NOT NULL,
      "employee_no" TEXT NOT NULL,
      "status" "AccessCredentialStatus" NOT NULL DEFAULT 'pending',
      "valid_from" TIMESTAMP(3),
      "valid_until" TIMESTAMP(3),
      "last_synced_at" TIMESTAMP(3),
      "last_sync_error" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "access_credentials_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "access_credentials_card_no_key" ON "access_credentials"("card_no")`
  await sql`CREATE INDEX IF NOT EXISTS "access_credentials_user_id_idx" ON "access_credentials"("user_id")`
  await sql`CREATE INDEX IF NOT EXISTS "access_credentials_visitor_id_idx" ON "access_credentials"("visitor_id")`
  await sql`CREATE INDEX IF NOT EXISTS "access_credentials_status_idx" ON "access_credentials"("status")`
  await sql`CREATE INDEX IF NOT EXISTS "access_credentials_employee_no_idx" ON "access_credentials"("employee_no")`

  await sql`
    DO $$ BEGIN
      ALTER TABLE "access_credentials"
        ADD CONSTRAINT "access_credentials_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `
  await sql`
    DO $$ BEGIN
      ALTER TABLE "access_credentials"
        ADD CONSTRAINT "access_credentials_visitor_id_fkey"
        FOREIGN KEY ("visitor_id") REFERENCES "visitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `

  await sql`
    CREATE TABLE IF NOT EXISTS "access_sync_jobs" (
      "id" TEXT NOT NULL,
      "credential_id" TEXT,
      "action" "AccessSyncAction" NOT NULL,
      "payload" JSONB NOT NULL DEFAULT '{}',
      "status" "AccessSyncJobStatus" NOT NULL DEFAULT 'pending',
      "attempts" INTEGER NOT NULL DEFAULT 0,
      "last_error" TEXT,
      "processed_at" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "access_sync_jobs_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS "access_sync_jobs_status_createdAt_idx" ON "access_sync_jobs"("status", "createdAt")`
  await sql`CREATE INDEX IF NOT EXISTS "access_sync_jobs_credential_id_idx" ON "access_sync_jobs"("credential_id")`

  await sql`
    DO $$ BEGIN
      ALTER TABLE "access_sync_jobs"
        ADD CONSTRAINT "access_sync_jobs_credential_id_fkey"
        FOREIGN KEY ("credential_id") REFERENCES "access_credentials"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `

  console.log("Access credential schema applied.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
