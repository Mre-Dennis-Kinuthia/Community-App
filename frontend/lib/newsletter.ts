import { prisma } from "@/lib/prisma"

export async function subscribeNewsletterEmail(params: {
  email: string
  source?: string
}): Promise<"created" | "reactivated" | "already_subscribed"> {
  const email = params.email.toLowerCase().trim()
  const source = params.source ?? "landing"

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  })

  if (!existing) {
    await prisma.newsletterSubscriber.create({
      data: { email, source },
    })
    return "created"
  }

  if (existing.unsubscribedAt) {
    await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        unsubscribedAt: null,
        subscribedAt: new Date(),
        source,
      },
    })
    return "reactivated"
  }

  return "already_subscribed"
}

export async function unsubscribeNewsletterByToken(
  token: string
): Promise<"unsubscribed" | "not_found" | "already_unsubscribed"> {
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
  })

  if (!subscriber) return "not_found"
  if (subscriber.unsubscribedAt) return "already_unsubscribed"

  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { unsubscribedAt: new Date() },
  })

  return "unsubscribed"
}
