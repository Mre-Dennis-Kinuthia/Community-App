import type { Session } from "next-auth"
import { prisma } from "@/lib/prisma"

/** Resolve DB user id from session (id or email upsert). */
export async function resolveUserIdFromSession(
  session: Session | null
): Promise<string | null> {
  const sessionUser = session?.user
  if (!sessionUser) return null

  if (typeof sessionUser.id === "string") {
    const existing = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true },
    })
    if (existing) return existing.id
  }

  const email =
    typeof sessionUser.email === "string"
      ? sessionUser.email.toLowerCase().trim()
      : null
  if (!email) return null

  const upserted = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: typeof sessionUser.name === "string" ? sessionUser.name : null,
      image:
        typeof (sessionUser as { image?: string }).image === "string"
          ? (sessionUser as { image?: string }).image
          : null,
    },
    update: {
      name: typeof sessionUser.name === "string" ? sessionUser.name : undefined,
      image:
        typeof (sessionUser as { image?: string }).image === "string"
          ? (sessionUser as { image?: string }).image
          : undefined,
    },
    select: { id: true },
  })

  return upserted.id
}
