import { randomBytes } from "crypto"
import type { Plan, PrismaClient } from "@prisma/client"
import { Prisma } from "@prisma/client"

export function generateMembershipPayToken(): string {
  return randomBytes(24).toString("base64url")
}

export function getAppBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "http://localhost:3000"
  const withProtocol = url.startsWith("http") ? url : `https://${url}`
  return withProtocol.replace(/\/$/, "")
}

export function buildMembershipPayUrl(token: string): string {
  return `${getAppBaseUrl()}/pay/${token}`
}

export function addBillingPeriodEnd(start: Date, interval: string): Date {
  const end = new Date(start)
  if (interval === "yearly" || interval === "year") {
    end.setFullYear(end.getFullYear() + 1)
  } else {
    end.setMonth(end.getMonth() + 1)
  }
  return end
}

export function generateInvoiceNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase()
  const rand = randomBytes(3).toString("hex").toUpperCase()
  return `INV-MEM-${stamp}-${rand}`
}

export async function resolveUserForMembership(
  prisma: PrismaClient,
  params: { email: string; name?: string | null; existingUserId?: string | null }
): Promise<string> {
  const email = params.email.toLowerCase().trim()
  if (params.existingUserId) {
    const byId = await prisma.user.findUnique({ where: { id: params.existingUserId } })
    if (byId && byId.email.toLowerCase() === email) return byId.id
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return existing.id

  const created = await prisma.user.create({
    data: {
      email,
      name: params.name?.trim() || null,
    },
  })
  return created.id
}

export async function activateMembershipPlan(
  prisma: PrismaClient,
  params: {
    userId: string
    plan: Plan
    amount: Prisma.Decimal
    currency: string
    method: string
    transactionId?: string | null
    phoneNumber?: string | null
    membershipPaymentLinkId?: string
  }
) {
  const now = new Date()
  const plan = params.plan

  return prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: {
        userId: params.userId,
        deletedAt: null,
        status: { in: ["active", "trialing"] },
      },
      data: {
        status: "cancelled",
        cancelAtPeriodEnd: false,
        updatedAt: now,
      },
    })

    const payment = await tx.payment.create({
      data: {
        userId: params.userId,
        amount: params.amount,
        currency: params.currency,
        method: params.method,
        status: "completed",
        transactionId: params.transactionId ?? undefined,
        metadata: {
          membershipPaymentLinkId: params.membershipPaymentLinkId,
          planId: plan.id,
          planName: plan.name,
          phoneNumber: params.phoneNumber ?? undefined,
        },
      },
    })

    const periodEnd = addBillingPeriodEnd(now, plan.interval)

    const subscription = await tx.subscription.create({
      data: {
        userId: params.userId,
        planId: plan.id,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      include: { plan: true },
    })

    await tx.payment.update({
      where: { id: payment.id },
      data: { subscriptionId: subscription.id },
    })

    await tx.invoice.create({
      data: {
        userId: params.userId,
        subscriptionId: subscription.id,
        paymentId: payment.id,
        invoiceNumber: generateInvoiceNumber(),
        amount: params.amount,
        currency: params.currency,
        status: "paid",
        dueDate: now,
        paidAt: now,
      },
    })

    if (params.membershipPaymentLinkId) {
      await tx.membershipPaymentLink.update({
        where: { id: params.membershipPaymentLinkId },
        data: {
          status: "paid",
          paidAt: now,
          paymentId: payment.id,
          subscriptionId: subscription.id,
          userId: params.userId,
          updatedAt: now,
        },
      })
    }

    return { payment, subscription, plan }
  })
}

export async function fulfillMembershipPayment(
  prisma: PrismaClient,
  params: {
    linkId: string
    userId: string
    method: string
    transactionId?: string | null
    phoneNumber?: string | null
  }
) {
  const link = await prisma.membershipPaymentLink.findUnique({
    where: { id: params.linkId },
    include: { plan: true },
  })

  if (!link) {
    throw new Error("Payment link not found")
  }
  if (link.status === "paid") {
    throw new Error("This payment link has already been used")
  }
  if (link.status === "cancelled") {
    throw new Error("This payment link was cancelled")
  }
  if (link.expiresAt < new Date()) {
    await prisma.membershipPaymentLink.update({
      where: { id: link.id },
      data: { status: "expired", updatedAt: new Date() },
    })
    throw new Error("This payment link has expired")
  }

  return activateMembershipPlan(prisma, {
    userId: params.userId,
    plan: link.plan,
    amount: link.amount,
    currency: link.currency,
    method: params.method,
    transactionId: params.transactionId,
    phoneNumber: params.phoneNumber,
    membershipPaymentLinkId: link.id,
  })
}

export function serializePlan(plan: Plan) {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: Number(plan.price),
    currency: plan.currency,
    interval: plan.interval,
    features: plan.features,
    isActive: plan.isActive,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  }
}

export function serializeSubscription(sub: {
  id: string
  userId: string
  planId: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
  plan: Plan
  user?: { id: string; name: string | null; email: string } | null
}) {
  return {
    id: sub.id,
    userId: sub.userId,
    planId: sub.planId,
    status: sub.status,
    currentPeriodStart: sub.currentPeriodStart.toISOString(),
    currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
    plan: serializePlan(sub.plan),
    member: sub.user
      ? { id: sub.user.id, name: sub.user.name, email: sub.user.email }
      : undefined,
  }
}

export type MembershipLinkRow = {
  id: string
  token: string
  planId: string
  recipientEmail: string
  recipientName: string | null
  userId: string | null
  amount: Prisma.Decimal
  currency: string
  status: string
  expiresAt: Date
  paidAt: Date | null
  createdAt: Date
  adminNote: string | null
  plan: Plan
  user?: { id: string; name: string | null; email: string } | null
}

export function serializePaymentLink(link: MembershipLinkRow, includePayUrl = false) {
  return {
    id: link.id,
    token: link.token,
    planId: link.planId,
    recipientEmail: link.recipientEmail,
    recipientName: link.recipientName,
    userId: link.userId,
    amount: Number(link.amount),
    currency: link.currency,
    status: link.status,
    expiresAt: link.expiresAt.toISOString(),
    paidAt: link.paidAt?.toISOString() ?? null,
    createdAt: link.createdAt.toISOString(),
    adminNote: link.adminNote,
    plan: serializePlan(link.plan),
    member: link.user
      ? { id: link.user.id, name: link.user.name, email: link.user.email }
      : null,
    payUrl: includePayUrl ? buildMembershipPayUrl(link.token) : undefined,
  }
}
