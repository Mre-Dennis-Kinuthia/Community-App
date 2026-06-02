import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/** GET /api/billing/payments/[id]/status — poll M-Pesa checkout completion */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payment = await prisma.payment.findUnique({
      where: { id },
      select: { id: true, status: true, metadata: true, userId: true },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404, headers: corsHeaders })
    }

    let subscription: {
      id: string
      status: string
      currentPeriodEnd: string
      plan: { name: string }
    } | null = null

    if (payment.status === "completed") {
      const sub = await prisma.subscription.findFirst({
        where: { userId: payment.userId, deletedAt: null },
        orderBy: { updatedAt: "desc" },
        include: { plan: { select: { name: true } } },
      })
      if (sub) {
        subscription = {
          id: sub.id,
          status: sub.status,
          currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
          plan: { name: sub.plan.name },
        }
      }
    }

    return NextResponse.json(
      {
        paymentId: payment.id,
        status: payment.status,
        completed: payment.status === "completed",
        failed: payment.status === "failed",
        subscription,
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error("[PAYMENT STATUS]", error)
    return NextResponse.json({ error: "Failed to load status" }, { status: 500, headers: corsHeaders })
  }
}
