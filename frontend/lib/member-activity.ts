import { prisma } from "@/lib/prisma"

const TOUCH_INTERVAL_MS = 5 * 60 * 1000

/**
 * Record that a member used the platform. Throttled to at most once every 5 minutes.
 */
export async function touchMemberLastActive(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastActiveAt: true },
  })

  if (!user) return

  const now = Date.now()
  if (user.lastActiveAt && now - user.lastActiveAt.getTime() < TOUCH_INTERVAL_MS) {
    return
  }

  await prisma.user.update({
    where: { id: userId },
    data: { lastActiveAt: new Date(now) },
  })
}

/** Fire-and-forget helper for auth and API routes. */
export function touchMemberLastActiveInBackground(userId: string): void {
  void touchMemberLastActive(userId).catch((error) => {
    console.error("[MEMBER ACTIVITY] Failed to update lastActiveAt:", error)
  })
}
