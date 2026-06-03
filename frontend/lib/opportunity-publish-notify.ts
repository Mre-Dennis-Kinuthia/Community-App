import { prisma } from "@/lib/prisma"
import { isEmailConfigured, sendEmailsInBackground } from "@/lib/email/send"
import { sendCommunityOpportunityEmail } from "@/lib/email/opportunity-published"
import { getCommunityOpportunityUrl } from "@/lib/app-url"

export async function notifyCommunityOpportunityPublished(opportunity: {
  id: string
  title: string
  summary?: string | null
  applyUrl: string
  source?: string | null
}) {
  const actionUrl = `/resources/opportunities/${opportunity.id}`

  try {
    await prisma.notification.create({
      data: {
        userId: null,
        title: "New opportunity for you",
        message: opportunity.source
          ? `${opportunity.title} — via ${opportunity.source}`
          : opportunity.title,
        type: "info",
        category: "opportunity",
        actionUrl,
        relatedId: opportunity.id,
        relatedType: "community_opportunity",
      },
    })
  } catch (error) {
    console.error("[OPPORTUNITY NOTIFY] In-app notification failed:", error)
  }

  if (!isEmailConfigured()) {
    return { emailed: 0 }
  }

  try {
    const users = await prisma.user.findMany({
      where: { email: { not: "" } },
      select: { email: true, name: true },
    })

    const seen = new Set<string>()
    const tasks: Array<{
      send: () => ReturnType<typeof sendCommunityOpportunityEmail>
      context: string
    }> = []

    for (const user of users) {
      const email = user.email.toLowerCase().trim()
      if (!email || seen.has(email)) continue
      seen.add(email)

      tasks.push({
        send: () =>
          sendCommunityOpportunityEmail({
            to: email,
            name: user.name,
            title: opportunity.title,
            summary: opportunity.summary,
            source: opportunity.source,
            opportunityId: opportunity.id,
            applyUrl: opportunity.applyUrl,
          }),
        context: `opportunity-published:${opportunity.id}:${email}`,
      })
    }

    sendEmailsInBackground(tasks)
    console.log(`[OPPORTUNITY NOTIFY] Queued emails for ${seen.size} member(s):`, opportunity.id)
    return { emailed: seen.size }
  } catch (error) {
    console.error("[OPPORTUNITY NOTIFY] Email queue failed:", error)
    return { emailed: 0 }
  }
}

export { getCommunityOpportunityUrl }
