import type { Plan, PrismaClient } from "@prisma/client"
import { Prisma } from "@prisma/client"
import {
  activateMembershipPlan,
  buildMembershipPayUrl,
  fulfillMembershipPayment,
  generateMembershipPayToken,
} from "@/lib/membership-billing"
import { sendMembershipPaymentLinkEmail } from "@/lib/email/membership-payment-link"
import { sendMembershipRenewalReminderEmail } from "@/lib/email/membership-renewal"
import { notifyMembershipActivated } from "@/lib/membership-notifications"
import { isDarajaConfigured, initiateMpesaStkPush } from "@/lib/mpesa-stk"
import { isEmailConfigured } from "@/lib/email/send"

const DEFAULT_PLANS = [
  {
    name: "Star Connect",
    description:
      "For early and growth-stage founders ready to scale with dedicated support.",
    price: 13000,
    interval: "monthly",
    features: [
      "Global Passport — 120+ hubs",
      "Business development services",
      "Thematic acceleration programs",
      "Grants & funding opportunities",
    ],
  },
  {
    name: "Flex Membership",
    description: "Monthly community membership with workspace access benefits.",
    price: 8500,
    interval: "monthly",
    features: ["Co-working access", "Member events", "Community channels"],
  },
] as const

export async function ensureDefaultMembershipPlans(prisma: PrismaClient) {
  const count = await prisma.plan.count()
  if (count > 0) return { created: 0 }

  for (const p of DEFAULT_PLANS) {
    await prisma.plan.create({
      data: {
        name: p.name,
        description: p.description,
        price: new Prisma.Decimal(p.price),
        currency: "KES",
        interval: p.interval,
        features: [...p.features],
        isActive: true,
      },
    })
  }
  return { created: DEFAULT_PLANS.length }
}

export async function expireStaleMembershipLinks(prisma: PrismaClient) {
  const now = new Date()
  const result = await prisma.membershipPaymentLink.updateMany({
    where: { status: "pending", expiresAt: { lt: now } },
    data: { status: "expired", updatedAt: now },
  })
  return result.count
}

export async function markExpiredSubscriptions(prisma: PrismaClient) {
  const now = new Date()
  const result = await prisma.subscription.updateMany({
    where: {
      deletedAt: null,
      status: { in: ["active", "trialing"] },
      currentPeriodEnd: { lt: now },
      cancelAtPeriodEnd: false,
    },
    data: { status: "expired", updatedAt: now },
  })
  return result.count
}

export async function sendUpcomingRenewalReminders(prisma: PrismaClient) {
  if (!isEmailConfigured()) return { sent: 0 }

  const now = new Date()
  const inSevenDays = new Date(now)
  inSevenDays.setDate(inSevenDays.getDate() + 7)

  const subs = await prisma.subscription.findMany({
    where: {
      deletedAt: null,
      status: "active",
      cancelAtPeriodEnd: false,
      currentPeriodEnd: { gte: now, lte: inSevenDays },
    },
    include: {
      plan: true,
      user: { select: { email: true, name: true } },
    },
  })

  let sent = 0
  for (const sub of subs) {
    if (!sub.user.email) continue
    const result = await sendMembershipRenewalReminderEmail({
      to: sub.user.email,
      name: sub.user.name,
      planName: sub.plan.name,
      amount: Number(sub.plan.price),
      currency: sub.plan.currency,
      renewDate: sub.currentPeriodEnd,
      billingUrl: `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || ""}/billing`,
    })
    if (result.ok) sent++
  }
  return { sent }
}

export type CreatePaymentLinkParams = {
  planId: string
  recipientEmail: string
  recipientName?: string | null
  userId?: string | null
  amount?: number
  expiresInDays?: number
  adminNote?: string | null
  createdByAdminId?: string | null
  sendEmail?: boolean
}

export async function createMembershipPaymentLink(
  prisma: PrismaClient,
  params: CreatePaymentLinkParams
) {
  const plan = await prisma.plan.findFirst({
    where: { id: params.planId, isActive: true },
  })
  if (!plan) throw new Error("Plan not found or inactive")

  const email = params.recipientEmail.toLowerCase().trim()
  let userId = params.userId ?? null
  if (!userId) {
    const user = await prisma.user.findUnique({ where: { email } })
    userId = user?.id ?? null
    if (user && !params.recipientName) {
      params.recipientName = user.name
    }
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + (params.expiresInDays ?? 14))

  const token = generateMembershipPayToken()
  const link = await prisma.membershipPaymentLink.create({
    data: {
      token,
      planId: plan.id,
      recipientEmail: email,
      recipientName: params.recipientName?.trim() || null,
      userId,
      amount: new Prisma.Decimal(params.amount ?? Number(plan.price)),
      currency: plan.currency,
      expiresAt,
      adminNote: params.adminNote?.trim() || null,
      createdByAdminId: params.createdByAdminId ?? null,
    },
    include: { plan: true },
  })

  const payUrl = buildMembershipPayUrl(token)

  if (params.sendEmail !== false && isEmailConfigured()) {
    await sendMembershipPaymentLinkEmail({
      to: email,
      recipientName: params.recipientName,
      planName: plan.name,
      amount: Number(link.amount),
      currency: link.currency,
      interval: plan.interval,
      payUrl,
      expiresAt: link.expiresAt,
      adminNote: link.adminNote,
    })
  }

  return { link, payUrl, plan }
}

export type InitiateMembershipPaymentParams = {
  userId: string
  plan: Plan
  amount: Prisma.Decimal
  currency: string
  phoneNumber: string
  membershipPaymentLinkId?: string
}

/** Creates pending payment; completes automatically when Daraja is not configured. */
export async function initiateMembershipPayment(
  prisma: PrismaClient,
  params: InitiateMembershipPaymentParams
) {
  const payment = await prisma.payment.create({
    data: {
      userId: params.userId,
      amount: params.amount,
      currency: params.currency,
      method: "mpesa",
      status: "pending",
      metadata: {
        type: "membership",
        planId: params.plan.id,
        planName: params.plan.name,
        phoneNumber: params.phoneNumber,
        membershipPaymentLinkId: params.membershipPaymentLinkId,
      },
    },
  })

  if (isDarajaConfigured()) {
    const stk = await initiateMpesaStkPush({
      phoneNumber: params.phoneNumber,
      amount: Number(params.amount),
      accountReference: payment.id.slice(0, 12),
      transactionDesc: `Membership ${params.plan.name}`.slice(0, 13),
    })
    if (!stk.ok) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed", metadata: { ...(payment.metadata as object), stkError: stk.error } },
      })
      throw new Error(stk.error || "M-Pesa request failed")
    }
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        metadata: {
          ...(payment.metadata as object),
          checkoutRequestId: stk.checkoutRequestId,
          merchantRequestId: stk.merchantRequestId,
        },
      },
    })
    return {
      paymentId: payment.id,
      pending: true,
      message: "Check your phone to approve the M-Pesa payment.",
    }
  }

  const result = await completeMembershipPaymentById(prisma, payment.id)
  return {
    paymentId: payment.id,
    pending: false,
    message: "Membership activated.",
    subscription: result.subscription,
    plan: result.plan,
  }
}

export async function completeMembershipPaymentById(prisma: PrismaClient, paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment) throw new Error("Payment not found")
  if (payment.status === "completed") {
    const metaDone = payment.metadata as { membershipPaymentLinkId?: string; planId?: string } | null
    const sub = await prisma.subscription.findFirst({
      where: { userId: payment.userId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      include: { plan: true },
    })
    const plan =
      sub?.plan ??
      (metaDone?.planId
        ? await prisma.plan.findUnique({ where: { id: metaDone.planId } })
        : null)
    return {
      alreadyCompleted: true as const,
      subscription: sub ?? undefined,
      plan: plan ?? undefined,
    }
  }

  const meta = payment.metadata as {
    type?: string
    planId?: string
    membershipPaymentLinkId?: string
    phoneNumber?: string
  } | null

  if (meta?.type !== "membership" || !meta.planId) {
    throw new Error("Not a membership payment")
  }

  const plan = await prisma.plan.findUnique({ where: { id: meta.planId } })
  if (!plan) throw new Error("Plan not found")

  const result =
    meta.membershipPaymentLinkId != null
      ? await fulfillMembershipPayment(prisma, {
          linkId: meta.membershipPaymentLinkId,
          userId: payment.userId,
          method: "mpesa",
          phoneNumber: meta.phoneNumber,
          transactionId: payment.id,
          existingPaymentId: payment.id,
        })
      : await activateMembershipPlan(prisma, {
          userId: payment.userId,
          plan,
          amount: payment.amount,
          currency: payment.currency,
          method: "mpesa",
          phoneNumber: meta.phoneNumber,
          transactionId: payment.id,
          existingPaymentId: payment.id,
        })

  const user = await prisma.user.findUnique({
    where: { id: payment.userId },
    select: { email: true, name: true },
  })
  if (user?.email) {
    notifyMembershipActivated({
      memberEmail: user.email,
      memberName: user.name,
      plan,
      periodEnd: result.subscription.currentPeriodEnd,
      amount: Number(payment.amount),
      currency: payment.currency,
      method: payment.method,
      source: meta.membershipPaymentLinkId != null ? "payment_link" : "self_serve",
    })
  }

  return result
}

export async function runMembershipCronJobs(prisma: PrismaClient) {
  await ensureDefaultMembershipPlans(prisma)
  const expiredLinks = await expireStaleMembershipLinks(prisma)
  const expiredSubs = await markExpiredSubscriptions(prisma)
  const reminders = await sendUpcomingRenewalReminders(prisma)
  return { expiredLinks, expiredSubs, reminders }
}
