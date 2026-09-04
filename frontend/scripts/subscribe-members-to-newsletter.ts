/**
 * Add every community member to the newsletter list (skip existing / opted-out rows).
 * Usage: npx tsx --env-file=.env.local scripts/subscribe-members-to-newsletter.ts
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({ select: { email: true } })
  const emails = [
    ...new Set(
      users
        .map((user) => user.email?.toLowerCase().trim())
        .filter((email): email is string => Boolean(email))
    ),
  ]

  if (emails.length === 0) {
    console.log("[subscribe-members-to-newsletter] No members found")
    return
  }

  const existing = await prisma.newsletterSubscriber.findMany({
    where: { email: { in: emails } },
    select: { email: true },
  })
  const existingSet = new Set(existing.map((row) => row.email.toLowerCase()))
  const toCreate = emails.filter((email) => !existingSet.has(email))

  const chunkSize = 500
  for (let i = 0; i < toCreate.length; i += chunkSize) {
    const chunk = toCreate.slice(i, i + chunkSize)
    await prisma.newsletterSubscriber.createMany({
      data: chunk.map((email) => ({ email, source: "member" })),
      skipDuplicates: true,
    })
  }

  console.log(
    `[subscribe-members-to-newsletter] created=${toCreate.length} already=${emails.length - toCreate.length}`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
