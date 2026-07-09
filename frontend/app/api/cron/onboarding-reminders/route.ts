import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { runOnboardingReminderJobs } from "@/lib/onboarding-reminders"

export const dynamic = "force-dynamic"

/**
 * GET /api/cron/onboarding-reminders
 * Sends a single reminder to members who registered 48h ago but haven't finished onboarding.
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
    const result = await runOnboardingReminderJobs(prisma)
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error("[CRON ONBOARDING REMINDERS]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron failed" },
      { status: 500 }
    )
  }
}
