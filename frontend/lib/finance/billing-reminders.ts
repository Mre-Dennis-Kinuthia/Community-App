import type { PrismaClient } from "@prisma/client"
import { createNotification } from "@/lib/notifications"
import { sendEmailInBackground } from "@/lib/email/send"
import {
  sendInvoiceReminderEmail,
  sendSubscriptionRenewalReminderEmail,
} from "@/lib/email/messages"
import { getAppBaseUrl } from "@/lib/app-url"

const REMINDER_COOLDOWN_DAYS = 7

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function daysFromNow(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

export async function runBillingReminderJobs(prisma: PrismaClient) {
  const now = new Date()
  const dueSoonCutoff = daysFromNow(3)
  const cooldownBefore = daysAgo(REMINDER_COOLDOWN_DAYS)

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["draft", "overdue"] },
      OR: [{ dueDate: { lt: now } }, { status: "overdue" }],
      AND: [
        {
          OR: [
            { lastReminderAt: null },
            { lastReminderAt: { lt: cooldownBefore } },
          ],
        },
      ],
    },
    include: { user: { select: { id: true, email: true, name: true } } },
    take: 100,
  })

  const dueSoonInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["draft"] },
      dueDate: { gte: now, lte: dueSoonCutoff },
      OR: [
        { lastReminderAt: null },
        { lastReminderAt: { lt: cooldownBefore } },
      ],
    },
    include: { user: { select: { id: true, email: true, name: true } } },
    take: 100,
  })

  const expiringSubscriptions = await prisma.subscription.findMany({
    where: {
      deletedAt: null,
      status: { in: ["active", "trialing"] },
      cancelAtPeriodEnd: false,
      currentPeriodEnd: { gte: now, lte: dueSoonCutoff },
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      plan: { select: { name: true, price: true, currency: true } },
    },
    take: 100,
  })

  let invoiceReminders = 0
  let subscriptionReminders = 0

  for (const invoice of [...overdueInvoices, ...dueSoonInvoices]) {
    if (!invoice.userId) continue
    const isOverdue = invoice.status === "overdue" || (invoice.dueDate && invoice.dueDate < now)
    const title = isOverdue ? "Invoice overdue" : "Invoice due soon"
    const dueStr = invoice.dueDate
      ? invoice.dueDate.toLocaleDateString("en-KE")
      : "soon"

    await createNotification({
      userId: invoice.userId,
      title,
      message: `Invoice ${invoice.invoiceNumber} for ${invoice.currency} ${Number(invoice.amount).toLocaleString()} is ${isOverdue ? "overdue" : `due on ${dueStr}`}.`,
      type: "warning",
      category: "billing",
      actionUrl: "/billing",
      relatedId: invoice.id,
      relatedType: "invoice",
      skipEmail: true,
    })

    if (invoice.user.email) {
      const billingUrl = `${getAppBaseUrl()}/billing`
      sendEmailInBackground(
        () =>
          sendInvoiceReminderEmail({
            to: invoice.user.email!,
            name: invoice.user.name,
            invoiceNumber: invoice.invoiceNumber,
            amount: Number(invoice.amount),
            currency: invoice.currency,
            dueDate: invoice.dueDate,
            isOverdue: Boolean(isOverdue),
            billingUrl,
          }),
        "billing-reminder"
      )
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { lastReminderAt: now, ...(isOverdue && invoice.status !== "overdue" ? { status: "overdue" } : {}) },
    })
    invoiceReminders++
  }

  for (const sub of expiringSubscriptions) {
    const endStr = sub.currentPeriodEnd.toLocaleDateString("en-KE")
    await createNotification({
      userId: sub.userId,
      title: "Membership renewing soon",
      message: `Your ${sub.plan.name} membership renews on ${endStr}.`,
      type: "info",
      category: "billing",
      actionUrl: "/billing",
      relatedId: sub.id,
      relatedType: "subscription",
      skipEmail: true,
    })

    if (sub.user.email) {
      const billingUrl = `${getAppBaseUrl()}/billing`
      sendEmailInBackground(
        () =>
          sendSubscriptionRenewalReminderEmail({
            to: sub.user.email!,
            name: sub.user.name,
            planName: sub.plan.name,
            renewsOn: sub.currentPeriodEnd,
            billingUrl,
          }),
        "subscription-reminder"
      )
    }
    subscriptionReminders++
  }

  return { invoiceReminders, subscriptionReminders }
}
