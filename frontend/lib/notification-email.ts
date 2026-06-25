import { prisma } from "@/lib/prisma"
import { sendNotificationEmail } from "@/lib/email/notification"
import { isEmailConfigured, sendEmailsInBackground } from "@/lib/email/send"

export type NotificationEmailPayload = {
  userId?: string | null
  userIds?: string[]
  title: string
  message: string
  actionUrl?: string | null
  skipEmail?: boolean
}

async function resolveNotificationRecipients(payload: NotificationEmailPayload) {
  if (payload.userIds?.length) {
    return prisma.user.findMany({
      where: { id: { in: payload.userIds }, email: { not: "" } },
      select: { email: true, name: true },
    })
  }

  if (payload.userId) {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, name: true },
    })
    return user?.email ? [user] : []
  }

  return prisma.user.findMany({
    where: { email: { not: "" } },
    select: { email: true, name: true },
  })
}

export async function deliverNotificationEmails(payload: NotificationEmailPayload) {
  if (payload.skipEmail || !isEmailConfigured()) return

  try {
    const users = await resolveNotificationRecipients(payload)
    const seen = new Set<string>()
    const tasks: Array<{
      send: () => ReturnType<typeof sendNotificationEmail>
      context: string
    }> = []

    for (const user of users) {
      const email = user.email.toLowerCase().trim()
      if (!email || seen.has(email)) continue
      seen.add(email)

      tasks.push({
        send: () =>
          sendNotificationEmail({
            to: email,
            name: user.name,
            title: payload.title,
            message: payload.message,
            actionUrl: payload.actionUrl,
          }),
        context: `notification:${email}:${payload.title.slice(0, 40)}`,
      })
    }

    if (tasks.length > 0) {
      sendEmailsInBackground(tasks)
    }
  } catch (error) {
    console.error("[NOTIFICATION EMAIL] Failed to queue emails:", error)
  }
}
