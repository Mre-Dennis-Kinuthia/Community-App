import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureDefaultMembershipPlans } from "@/lib/membership-automation"
import { serializePlan } from "@/lib/membership-billing"
import { corsHeaders } from "@/middleware-cors"

/**
 * GET /api/membership/plans
 * Public list of active membership plans (seeds defaults if empty).
 */
export async function GET() {
  try {
    await ensureDefaultMembershipPlans(prisma)
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    })
    return NextResponse.json(
      { plans: plans.map(serializePlan) },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error("[MEMBERSHIP PLANS]", error)
    return NextResponse.json({ error: "Failed to load plans" }, { status: 500, headers: corsHeaders })
  }
}
