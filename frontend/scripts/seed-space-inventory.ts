#!/usr/bin/env tsx
/**
 * Bootstrap space inventory from existing Workspace listings.
 *
 * Usage (from Community-App/frontend):
 *   npx tsx scripts/seed-space-inventory.ts
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const ASSET_TEMPLATES = [
  { slug: "hot-desk-area", name: "Hot Desk Area", type: "hot_desk" as const, capacity: 20 },
  { slug: "meeting-room-1", name: "Meeting Room 1", type: "meeting_room" as const, capacity: 4 },
  { slug: "meeting-room-2", name: "Meeting Room 2", type: "meeting_room" as const, capacity: 10 },
  { slug: "meeting-room-3", name: "Meeting Room 3", type: "meeting_room" as const, capacity: 35 },
  { slug: "private-office-1", name: "Private Office 1", type: "private_office" as const, capacity: 4 },
]

async function main() {
  const workspaces = await prisma.workspace.findMany({
    where: { deletedAt: null, isActive: true },
  })

  if (workspaces.length === 0) {
    console.log("No active workspaces found. Create a workspace in admin first.")
    return
  }

  for (const ws of workspaces) {
    const existing = await prisma.location.findFirst({
      where: { workspaceId: ws.id },
    })
    if (existing) {
      console.log(`Location already exists for workspace: ${ws.name}`)
      continue
    }

    const location = await prisma.location.create({
      data: {
        name: ws.name,
        slug: ws.slug,
        address: ws.address ?? ws.location ?? null,
        workspaceId: ws.id,
        isActive: true,
      },
    })

    const floor = await prisma.floor.create({
      data: {
        locationId: location.id,
        name: "Ground Floor",
        level: 0,
      },
    })

    const openZone = await prisma.zone.create({
      data: { floorId: floor.id, name: "Open Workspace", type: "open_area" },
    })

    const meetingZone = await prisma.zone.create({
      data: { floorId: floor.id, name: "Meeting Rooms", type: "meeting_area" },
    })

    for (const tpl of ASSET_TEMPLATES) {
      const zoneId =
        tpl.type === "hot_desk" ? openZone.id : meetingZone.id
      await prisma.spaceAsset.create({
        data: {
          zoneId,
          name: tpl.name,
          slug: tpl.slug,
          type: tpl.type,
          capacity: tpl.capacity,
          isBookable: true,
          status: "available",
        },
      })
    }

    console.log(`Created inventory for: ${ws.name} (${location.id})`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
