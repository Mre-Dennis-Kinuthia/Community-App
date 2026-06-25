import type { PrismaClient } from "@prisma/client"
import { createNotification } from "@/lib/notifications"
import { sendEmail, sendEmailInBackground } from "@/lib/email/send"

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
    })

    if (invoice.user.email) {
      sendEmailInBackground(
        () =>
          sendEmail({
            to: invoice.user.email!,
            subject: `Impact Hub Nairobi — ${title}`,
            html: `<p>Hi ${invoice.user.name || "there"},</p>
<p>Your invoice <strong>${invoice.invoiceNumber}</strong> (${invoice.currency} ${Number(invoice.amount).toLocaleString()}) is ${isOverdue ? "overdue" : `due on ${dueStr}`}.</p>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/billing">View billing</a></p>`,
            text: `Invoice ${invoice.invoiceNumber} reminder.`,
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
    })

    if (sub.user.email) {
      sendEmailInBackground(
        () =>
          sendEmail({
            to: sub.user.email!,
            subject: "Impact Hub Nairobi — Membership renewal reminder",
            html: `<p>Hi ${sub.user.name || "there"},</p>
<p>Your <strong>${sub.plan.name}</strong> membership renews on ${endStr}.</p>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/billing">Manage billing</a></p>`,
            text: `Membership renews on ${endStr}.`,
          }),
        "subscription-reminder"
      )
    }
    subscriptionReminders++
  }

  return { invoiceReminders, subscriptionReminders }
}
