/**
 * Apply space inventory tables and workspace_bookings.space_asset_id.
 * Usage: npx tsx --env-file=.env.local scripts/apply-space-inventory.ts
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
  await sql`CREATE TYPE "ZoneType" AS ENUM ('open_area', 'private_wing', 'meeting_area', 'other')`
  await sql`CREATE TYPE "SpaceAssetType" AS ENUM ('hot_desk', 'dedicated_desk', 'meeting_room', 'private_office', 'phone_booth', 'event_space')`
  await sql`CREATE TYPE "SpaceAssetStatus" AS ENUM ('available', 'occupied', 'maintenance', 'reserved')`
  await sql`CREATE TYPE "DeskAssignmentType" AS ENUM ('permanent', 'hot_desk_pool')`
  await sql`CREATE TYPE "DeskAssignmentStatus" AS ENUM ('active', 'ended')`
  await sql`CREATE TYPE "CheckInMethod" AS ENUM ('app', 'admin', 'qr')`

  await sql`
    CREATE TABLE IF NOT EXISTS "locations" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "address" TEXT,
      "timezone" TEXT NOT NULL DEFAULT 'Africa/Nairobi',
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "workspace_id" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "locations_slug_key" ON "locations"("slug")`
  await sql`CREATE INDEX IF NOT EXISTS "locations_isActive_idx" ON "locations"("isActive")`
  await sql`CREATE INDEX IF NOT EXISTS "locations_workspace_id_idx" ON "locations"("workspace_id")`

  await sql`
    CREATE TABLE IF NOT EXISTS "floors" (
      "id" TEXT NOT NULL,
      "location_id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "level" INTEGER NOT NULL,
      "floor_plan_image_url" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "floors_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS "floors_location_id_idx" ON "floors"("location_id")`

  await sql`
    CREATE TABLE IF NOT EXISTS "zones" (
      "id" TEXT NOT NULL,
      "floor_id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "type" "ZoneType" NOT NULL DEFAULT 'other',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS "zones_floor_id_idx" ON "zones"("floor_id")`

  await sql`
    CREATE TABLE IF NOT EXISTS "space_assets" (
      "id" TEXT NOT NULL,
      "zone_id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "type" "SpaceAssetType" NOT NULL,
      "capacity" INTEGER NOT NULL DEFAULT 1,
      "amenities" JSONB,
      "status" "SpaceAssetStatus" NOT NULL DEFAULT 'available',
      "is_bookable" BOOLEAN NOT NULL DEFAULT true,
      "metadata" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "space_assets_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "space_assets_zone_id_slug_key" ON "space_assets"("zone_id", "slug")`
  await sql`CREATE INDEX IF NOT EXISTS "space_assets_zone_id_idx" ON "space_assets"("zone_id")`
  await sql`CREATE INDEX IF NOT EXISTS "space_assets_type_idx" ON "space_assets"("type")`
  await sql`CREATE INDEX IF NOT EXISTS "space_assets_status_idx" ON "space_assets"("status")`
  await sql`CREATE INDEX IF NOT EXISTS "space_assets_is_bookable_idx" ON "space_assets"("is_bookable")`

  await sql`
    CREATE TABLE IF NOT EXISTS "desk_assignments" (
      "id" TEXT NOT NULL,
      "user_id" TEXT NOT NULL,
      "space_asset_id" TEXT NOT NULL,
      "start_date" TIMESTAMP(3) NOT NULL,
      "end_date" TIMESTAMP(3),
      "type" "DeskAssignmentType" NOT NULL DEFAULT 'permanent',
      "status" "DeskAssignmentStatus" NOT NULL DEFAULT 'active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "desk_assignments_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS "desk_assignments_user_id_idx" ON "desk_assignments"("user_id")`
  await sql`CREATE INDEX IF NOT EXISTS "desk_assignments_space_asset_id_idx" ON "desk_assignments"("space_asset_id")`
  await sql`CREATE INDEX IF NOT EXISTS "desk_assignments_status_idx" ON "desk_assignments"("status")`

  await sql`
    CREATE TABLE IF NOT EXISTS "check_ins" (
      "id" TEXT NOT NULL,
      "user_id" TEXT NOT NULL,
      "location_id" TEXT NOT NULL,
      "checked_in_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "checked_out_at" TIMESTAMP(3),
      "method" "CheckInMethod" NOT NULL DEFAULT 'app',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS "check_ins_user_id_idx" ON "check_ins"("user_id")`
  await sql`CREATE INDEX IF NOT EXISTS "check_ins_location_id_idx" ON "check_ins"("location_id")`
  await sql`CREATE INDEX IF NOT EXISTS "check_ins_checked_in_at_idx" ON "check_ins"("checked_in_at")`

  await sql`
    ALTER TABLE "workspace_bookings"
    ADD COLUMN IF NOT EXISTS "space_asset_id" TEXT
  `
  await sql`CREATE INDEX IF NOT EXISTS "workspace_bookings_space_asset_id_idx" ON "workspace_bookings"("space_asset_id")`

  console.log("[apply-space-inventory] Space inventory schema applied")
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes("already exists")) {
    console.log("[apply-space-inventory] Schema partially exists — continuing is safe on re-run")
    return
  }
  console.error(error)
  process.exit(1)
})
