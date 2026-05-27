import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/billing
 * Get current user's billing information
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      )
    }

    const userId = session.user.id

    // Get user's subscription/plan (not soft-deleted)
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        deletedAt: null,
        status: { in: ["active", "trialing"] },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        plan: true,
      },
    })

    const subscriptionJson = subscription
      ? {
          id: subscription.id,
          userId: subscription.userId,
          planId: subscription.planId,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart.toISOString(),
          currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          createdAt: subscription.createdAt.toISOString(),
          updatedAt: subscription.updatedAt.toISOString(),
          deletedAt: subscription.deletedAt?.toISOString() ?? null,
          plan: {
            ...subscription.plan,
            price: Number(subscription.plan.price),
          },
        }
      : null

    // Get payment methods
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get recent invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    })

    return NextResponse.json(
      {
        subscription: subscriptionJson,
        paymentMethods,
        invoices,
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[BILLING API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch billing information" },
      { status: 500, headers: corsHeaders }
    )
  }
}
