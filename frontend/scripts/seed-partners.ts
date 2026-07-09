#!/usr/bin/env tsx
/**
 * Upsert landing partners into the partners table so /partners uses the same logos as the homepage.
 *
 * Usage: npm run partners:seed
 */
import { PrismaClient } from "@prisma/client"
import {
  LANDING_IMPLEMENTATION_PARTNERS,
  LANDING_STRATEGIC_PARTNERS,
} from "../lib/landing-partners"

const prisma = new PrismaClient()

const ALL_LANDING = [...LANDING_STRATEGIC_PARTNERS, ...LANDING_IMPLEMENTATION_PARTNERS]

async function main() {
  let upserted = 0

  for (const partner of ALL_LANDING) {
    const existing = await prisma.partner.findFirst({
      where: {
        name: partner.name,
        deletedAt: null,
      },
    })

    const data = {
      name: partner.name,
      type: "Partner",
      category: "Ecosystem",
      logoUrl: partner.logo,
      website: partner.href ?? null,
      location: "Nairobi, Kenya",
      locationType: "Local",
      isFeatured: LANDING_STRATEGIC_PARTNERS.some((p) => p.name === partner.name),
    }

    if (existing) {
      await prisma.partner.update({
        where: { id: existing.id },
        data,
      })
    } else {
      await prisma.partner.create({ data })
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
  .finally(() => prisma.$disconnect())
