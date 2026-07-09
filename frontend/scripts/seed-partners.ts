#!/usr/bin/env tsx
/**
 * Upsert landing partners into the partners table so /partners uses the same logos as the homepage.
 *
 * Usage: npm run partners:seed
 */
import { randomUUID } from "node:crypto"
import { config } from "dotenv"
import { resolve } from "node:path"
import { Pool } from "pg"
import {
  LANDING_IMPLEMENTATION_PARTNERS,
  LANDING_STRATEGIC_PARTNERS,
} from "../lib/landing-partners"

const root = resolve(__dirname, "..")
config({ path: resolve(root, ".env.local") })
config({ path: resolve(root, ".env") })

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL
if (!connectionString) {
  console.error("Set DATABASE_URL or DIRECT_URL in .env.local")
  process.exit(1)
}

const pool = new Pool({ connectionString })
const ALL_LANDING = [...LANDING_STRATEGIC_PARTNERS, ...LANDING_IMPLEMENTATION_PARTNERS]
const STRATEGIC_NAMES = new Set(LANDING_STRATEGIC_PARTNERS.map((p) => p.name))

async function main() {
  let upserted = 0

  for (const partner of ALL_LANDING) {
    const isFeatured = STRATEGIC_NAMES.has(partner.name)
    const existing = await pool.query<{ id: string }>(
      `SELECT id FROM partners WHERE name = $1 AND "deletedAt" IS NULL LIMIT 1`,
      [partner.name]
    )

    if (existing.rows[0]) {
      await pool.query(
        `UPDATE partners
         SET type = $2,
             category = $3,
             "logoUrl" = $4,
             website = $5,
             location = $6,
             "locationType" = $7,
             "isFeatured" = $8,
             "updatedAt" = NOW()
         WHERE id = $1`,
        [
          existing.rows[0].id,
          "Partner",
          "Ecosystem",
          partner.logo,
          partner.href ?? null,
          "Nairobi, Kenya",
          "Local",
          isFeatured,
        ]
      )
    } else {
      const id = randomUUID()
      await pool.query(
        `INSERT INTO partners (
           id, name, type, category, "logoUrl", website, location, "locationType",
           "isFeatured", focus, "createdAt", "updatedAt"
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
         )`,
        [
          id,
          partner.name,
          "Partner",
          "Ecosystem",
          partner.logo,
          partner.href ?? null,
          "Nairobi, Kenya",
          "Local",
          isFeatured,
          [],
        ]
      )
    }

    upserted++
    console.log(`✓ ${partner.name}`)
  }

  console.log(`\nSeeded ${upserted} partners from landing-partners.ts`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
  })
