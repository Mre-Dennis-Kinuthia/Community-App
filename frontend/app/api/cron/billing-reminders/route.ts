import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { runBillingReminderJobs } from "@/lib/finance/billing-reminders"

export const dynamic = "force-dynamic"

/**
 * GET /api/cron/billing-reminders
 * Overdue/due-soon invoices + expiring subscriptions. Idempotent (7-day cooldown).
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
    const result = await runBillingReminderJobs(prisma)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("[CRON BILLING REMINDERS]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron failed" },
      { status: 500 }
    )
  }
}
