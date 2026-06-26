#!/usr/bin/env tsx
/**
 * Delete every row in the connections table.
 * Run: npx tsx --env-file=.env.local scripts/reset-all-connections.ts
 */
import { prisma } from "../lib/prisma"

async function main() {
  const before = await prisma.connection.count()
  console.log(`Found ${before} connection(s).`)

  if (before === 0) {
    console.log("Nothing to delete.")
    return
  }

  const result = await prisma.connection.deleteMany()
  console.log(`Deleted ${result.count} connection(s).`)
}

main()
  .catch((error) => {
    console.error("Failed to reset connections:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
