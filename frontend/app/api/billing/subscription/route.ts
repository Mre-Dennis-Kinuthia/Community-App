import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { z } from "zod"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const patchBodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("change_plan"),
    planId: z.string().min(1, "planId is required"),
  }),
  z.object({ action: z.literal("schedule_cancel") }),
  z.object({ action: z.literal("resume") }),
  z.object({ action: z.literal("cancel_immediately") }),
])

async function getActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      deletedAt: null,
      status: { in: ["active", "trialing"] },
    },
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  })
}

/**
 * PATCH /api/billing/subscription
 * Self-serve plan change and cancellation (local subscription record).
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
    }

    const userId = session.user.id
    const body = await request.json()
    const input = patchBodySchema.parse(body)

    const sub = await getActiveSubscription(userId)
    if (!sub) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404, headers: corsHeaders }
      )
    }

    if (input.action === "change_plan") {
      if (input.planId === sub.planId) {
        return NextResponse.json(
          { message: "You are already on this plan.", subscription: serializeSubscription(sub) },
          { headers: corsHeaders }
        )
      }

      const newPlan = await prisma.plan.findFirst({
        where: { id: input.planId, isActive: true },
      })

      if (!newPlan) {
        return NextResponse.json({ error: "Plan not found or inactive" }, { status: 400, headers: corsHeaders })
      }

      const updated = await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          planId: newPlan.id,
          cancelAtPeriodEnd: false,
          updatedAt: new Date(),
        },
        include: { plan: true },
      })

      return NextResponse.json(
        {
          message: `Your plan is now ${newPlan.name}.`,
          subscription: serializeSubscription(updated),
        },
        { headers: corsHeaders }
      )
    }

    if (input.action === "schedule_cancel") {
      if (sub.cancelAtPeriodEnd) {
        return NextResponse.json(
          { message: "Cancellation at period end is already scheduled.", subscription: serializeSubscription(sub) },
          { headers: corsHeaders }
        )
      }

      const updated = await prisma.subscription.update({
        where: { id: sub.id },
        data: { cancelAtPeriodEnd: true, updatedAt: new Date() },
        include: { plan: true },
      })

      return NextResponse.json(
        {
          message: `Your subscription stays active until ${updated.currentPeriodEnd.toISOString().slice(0, 10)}. It will not renew after that.`,
          subscription: serializeSubscription(updated),
        },
        { headers: corsHeaders }
      )
    }

    if (input.action === "resume") {
      if (!sub.cancelAtPeriodEnd) {
        return NextResponse.json(
          { message: "Your subscription is already set to renew.", subscription: serializeSubscription(sub) },
          { headers: corsHeaders }
        )
      }

      const updated = await prisma.subscription.update({
        where: { id: sub.id },
        data: { cancelAtPeriodEnd: false, updatedAt: new Date() },
        include: { plan: true },
      })

      return NextResponse.json(
        {
          message: "Renewal is turned back on. Your plan will continue after the current period.",
          subscription: serializeSubscription(updated),
        },
        { headers: corsHeaders }
      )
    }

    // cancel_immediately
    const updated = await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "cancelled",
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      },
      include: { plan: true },
    })

    return NextResponse.json(
      {
        message: "Your subscription has been cancelled immediately.",
        subscription: serializeSubscription(updated),
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error("[BILLING SUBSCRIPTION API] Error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400, headers: corsHeaders }
      )
    }
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500, headers: corsHeaders }
    )
  }
}

function serializeSubscription(sub: {
  id: string
  userId: string
  planId: string
  status: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  plan: {
    id: string
    name: string
    description: string | null
    price: unknown
    currency: string
    interval: string
    features: unknown
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }
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
    deletedAt: sub.deletedAt?.toISOString() ?? null,
    plan: {
      ...sub.plan,
      createdAt: sub.plan.createdAt.toISOString(),
      updatedAt: sub.plan.updatedAt.toISOString(),
      price: Number(sub.plan.price),
    },
  }
}
