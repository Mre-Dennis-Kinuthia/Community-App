import type { PrismaClient } from "@prisma/client"
import { isOnboardingComplete } from "@/lib/member-segmentation"
import { sendOnboardingReminderEmail, sendEmailInBackground } from "@/lib/email"

const REMINDER_AFTER_MS = 48 * 60 * 60 * 1000
const REMINDER_WINDOW_MS = 24 * 60 * 60 * 1000

export async function runOnboardingReminderJobs(prisma: PrismaClient) {
  const now = Date.now()
  const windowStart = new Date(now - REMINDER_AFTER_MS - REMINDER_WINDOW_MS)
  const windowEnd = new Date(now - REMINDER_AFTER_MS)

  const candidates = await prisma.user.findMany({
    where: {
      createdAt: { gte: windowStart, lte: windowEnd },
      onboardingReminderSentAt: null,
      profile: { isNot: null },
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      profile: {
        select: {
          industry: true,
          memberType: true,
          role: true,
          organization: true,
        },
      },
    },
    take: 100,
  })

  let sent = 0

  for (const user of candidates) {
    if (!user.profile) continue
    if (isOnboardingComplete(user.profile)) continue

    sendEmailInBackground(
      () =>
        sendOnboardingReminderEmail({
          to: user.email,
          name: user.name,
        }),
      "onboarding-reminder"
    )

    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingReminderSentAt: new Date() },
    })

    sent++
  }

  return { checked: candidates.length, sent }
}

export function shouldShowOnboardingNudge(createdAt: Date | string): boolean {
  const age = Date.now() - new Date(createdAt).getTime()
  return age >= REMINDER_AFTER_MS
}
