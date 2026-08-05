/**
 * Backfill MemberProfile.slug from User.name for existing members.
 * Usage: npx tsx --env-file=.env.local scripts/backfill-member-slugs.ts
 */
import { PrismaClient } from "@prisma/client"
import { ensureMemberSlug } from "../lib/member-slug"

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      profile: { select: { slug: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  let created = 0
  let skipped = 0

  for (const user of users) {
    if (user.profile?.slug) {
      skipped++
      continue
    }
    const slug = await ensureMemberSlug(prisma, user)
    console.log(`${user.id} -> ${slug}`)
    created++
  }

  console.log(`Done. Assigned ${created} slugs, skipped ${skipped} (already set).`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
