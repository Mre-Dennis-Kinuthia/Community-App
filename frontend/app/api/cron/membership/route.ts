import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { runMembershipCronJobs } from "@/lib/membership-automation"

export const dynamic = "force-dynamic"

/**
 * GET /api/cron/membership
 * Vercel Cron: expire links/subscriptions, renewal reminders, seed default plans.
 * Set CRON_SECRET and send Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  if (secret) {
    const auth = request.headers.get("authorization")
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const result = await runMembershipCronJobs(prisma)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("[CRON MEMBERSHIP]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron failed" },
      { status: 500 }
    )
  }
}
