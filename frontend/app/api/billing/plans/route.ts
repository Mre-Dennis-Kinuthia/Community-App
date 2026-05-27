import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/billing/plans
 * Active membership plans (for plan changes in self-serve billing).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
    }

    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        currency: true,
        interval: true,
        features: true,
      },
    })

    const formatted = plans.map((p) => ({
      ...p,
      price: Number(p.price),
    }))

    return NextResponse.json({ plans: formatted }, { headers: corsHeaders })
  } catch (error) {
    console.error("[BILLING PLANS API] Error:", error)
    return NextResponse.json(
      { error: "Failed to load plans" },
      { status: 500, headers: corsHeaders }
    )
  }
}
