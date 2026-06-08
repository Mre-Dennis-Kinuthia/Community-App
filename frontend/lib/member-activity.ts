import { prisma } from "@/lib/prisma"

const TOUCH_INTERVAL_MS = 5 * 60 * 1000

async function readLastActiveAt(userId: string): Promise<Date | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastActiveAt: true },
    })
    return user?.lastActiveAt ?? null
  } catch {
    try {
      const rows = await prisma.$queryRaw<{ last_active_at: Date | null }[]>`
        SELECT last_active_at FROM users WHERE id = ${userId} LIMIT 1
      `
      return rows[0]?.last_active_at ?? null
    } catch {
      return null
    }
  }
}

async function writeLastActiveAt(userId: string, at: Date): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: at },
    })
  } catch {
    await prisma.$executeRaw`
      UPDATE users SET last_active_at = ${at}, updated_at = ${at}
      WHERE id = ${userId}
    `
  }
}

/**
 * Record that a member used the platform. Throttled to at most once every 5 minutes.
 */
export async function touchMemberLastActive(userId: string): Promise<void> {
  const lastActiveAt = await readLastActiveAt(userId)
  const now = Date.now()

  if (lastActiveAt && now - lastActiveAt.getTime() < TOUCH_INTERVAL_MS) {
    return
  }

  await writeLastActiveAt(userId, new Date(now))
}

/** Fire-and-forget helper for auth and API routes. */
export function touchMemberLastActiveInBackground(userId: string): void {
  void touchMemberLastActive(userId).catch((error) => {
    console.error("[MEMBER ACTIVITY] Failed to update lastActiveAt:", error)
  })
}
