import type { PrismaClient } from "@prisma/client"
import { isOnboardingComplete, onboardingSliceFromProfile } from "@/lib/member-segmentation"
import { sendOnboardingReminderEmail, sendEmailInBackground } from "@/lib/email"
import { createNotification } from "@/lib/notifications"

/** Days after signup when each onboarding reminder is due (cron runs daily). */
export const ONBOARDING_REMINDER_SCHEDULE_DAYS = [2, 5, 10, 14] as const

const profileSelectForReminder = {
  industry: true,
  memberType: true,
  role: true,
  organization: true,
  bio: true,
  interests: true,
  availability: true,
  phone: true,
  location: true,
  skills: true,
  socialLinks: true,
} as const

export function getNextOnboardingReminderDue(
  createdAt: Date | string,
  reminderCount: number
): Date | null {
  if (reminderCount >= ONBOARDING_REMINDER_SCHEDULE_DAYS.length) return null
  const days = ONBOARDING_REMINDER_SCHEDULE_DAYS[reminderCount]
  const due = new Date(createdAt)
  due.setDate(due.getDate() + days)
  return due
}

export function isOnboardingReminderDue(
  createdAt: Date | string,
  reminderCount: number,
  now: Date = new Date()
): boolean {
  const due = getNextOnboardingReminderDue(createdAt, reminderCount)
  return due !== null && now >= due
}

export async function runOnboardingReminderJobs(prisma: PrismaClient) {
  const now = new Date()
  const scheduleLength = ONBOARDING_REMINDER_SCHEDULE_DAYS.length
  const firstReminderDays = ONBOARDING_REMINDER_SCHEDULE_DAYS[0]
  const earliestSignup = new Date(now)
  earliestSignup.setDate(earliestSignup.getDate() - firstReminderDays)

  const candidates = await prisma.user.findMany({
    where: {
      createdAt: { lte: earliestSignup },
      onboardingReminderCount: { lt: scheduleLength },
      profile: { isNot: null },
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      onboardingReminderCount: true,
      profile: {
        select: profileSelectForReminder,
      },
      image: true,
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  })

  let sent = 0
  let skippedComplete = 0
  let skippedNotDue = 0

  for (const user of candidates) {
    if (!user.profile) continue

    if (
      isOnboardingComplete(
        onboardingSliceFromProfile({
          ...user.profile,
          user: { image: user.image },
        })
      )
    ) {
      skippedComplete++
      continue
    }

    if (!isOnboardingReminderDue(user.createdAt, user.onboardingReminderCount, now)) {
      skippedNotDue++
      continue
    }

    const reminderNumber = user.onboardingReminderCount + 1
    const notificationTitle =
      reminderNumber === 1
        ? "Finish your profile"
        : "Reminder: complete your onboarding"

    await createNotification({
      userId: user.id,
      title: notificationTitle,
      message:
        "Complete your profile to appear in the directory, register for events, and book workspace.",
      type: "info",
      category: "account",
      actionUrl: "/onboarding",
      skipEmail: true,
    })

    sendEmailInBackground(
      () =>
        sendOnboardingReminderEmail({
          to: user.email,
          name: user.name,
          reminderNumber,
        }),
      `onboarding-reminder-${reminderNumber}`
    )

    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingReminderCount: reminderNumber,
        onboardingReminderSentAt: now,
      },
    })

    sent++
  }

  return {
    checked: candidates.length,
    sent,
    skippedComplete,
    skippedNotDue,
    scheduleDays: [...ONBOARDING_REMINDER_SCHEDULE_DAYS],
  }
}

export function shouldShowOnboardingNudge(createdAt: Date | string): boolean {
  const firstDue = getNextOnboardingReminderDue(createdAt, 0)
  if (!firstDue) return false
  return Date.now() >= firstDue.getTime()
}
