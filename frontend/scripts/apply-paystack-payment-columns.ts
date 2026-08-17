/**
 * Add Paystack payment FK columns on `payments` only.
 * Safer than `prisma db push` when the DB has unrelated schema drift
 * (e.g. visitors FK orphans, maintenance_tickets table).
 *
 * Usage: npm run db:apply-paystack-payments
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
console.log(`[apply-paystack-payments] Connecting to ${host}`)

const sql = neon(connectionString)

async function tryStep(name: string, statement: string) {
  try {
    await sql.query(statement)
    console.log(`[apply-paystack-payments] OK: ${name}`)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (
      msg.includes("already exists") ||
      msg.includes("duplicate") ||
      msg.includes("duplicate_column")
    ) {
      console.log(`[apply-paystack-payments] Skip (exists): ${name}`)
      return
    }
    throw err
  }
}

async function main() {
  const paymentCols = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments'
  `
  const names = new Set(paymentCols.map((r: { column_name: string }) => r.column_name))
  console.log("[apply-paystack-payments] payments columns:", [...names].sort().join(", "))

  if (!names.has("bookingId")) {
    await sql`ALTER TABLE "payments" ADD COLUMN "bookingId" TEXT`
    console.log("[apply-paystack-payments] Added column bookingId")
  } else {
    console.log("[apply-paystack-payments] Skip column bookingId (exists)")
  }

  if (!names.has("event_registration_id")) {
    await sql`ALTER TABLE "payments" ADD COLUMN "event_registration_id" TEXT`
    console.log("[apply-paystack-payments] Added column event_registration_id")
  } else {
    console.log("[apply-paystack-payments] Skip column event_registration_id (exists)")
  }

  await tryStep(
    "payments_bookingId_key",
    `CREATE UNIQUE INDEX IF NOT EXISTS "payments_bookingId_key" ON "payments"("bookingId")`
  )
  await tryStep(
    "payments_event_registration_id_key",
    `CREATE UNIQUE INDEX IF NOT EXISTS "payments_event_registration_id_key" ON "payments"("event_registration_id")`
  )

  await tryStep(
    "payments_bookingId_fkey",
    `ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey"
      FOREIGN KEY ("bookingId") REFERENCES "workspace_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE`
  )
  await tryStep(
    "payments_event_registration_id_fkey",
    `ALTER TABLE "payments" ADD CONSTRAINT "payments_event_registration_id_fkey"
      FOREIGN KEY ("event_registration_id") REFERENCES "event_registrations"("id") ON DELETE SET NULL ON UPDATE CASCADE`
  )

  const verify = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payments'
      AND column_name IN ('bookingId', 'event_registration_id')
    ORDER BY column_name
  `
  console.log(
    "[apply-paystack-payments] Verified columns:",
    verify.map((r: { column_name: string }) => r.column_name).join(", ") || "(none)"
  )
  console.log("[apply-paystack-payments] Paystack payment columns are ready.")
}

main().catch((err) => {
  console.error("[apply-paystack-payments] Failed:", err instanceof Error ? err.message : err)
  process.exit(1)
})
