import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isFeatureEnabled } from "@/lib/feature-flags"

async function resolveUserId(session: Awaited<ReturnType<typeof auth>>) {
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  return user?.id ?? null
}

export async function GET() {
  if (!isFeatureEnabled("operationsModule")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = await resolveUserId(session)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const now = new Date()
    const profile = await prisma.memberProfile.findUnique({ where: { userId } })
    const tier = profile?.membershipTier

    const surveys = await prisma.survey.findMany({
      where: {
        status: "active",
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      include: {
        responses: { where: { userId }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    const active = surveys
      .filter((s) => {
        if (!s.targetAudience || s.targetAudience === "all") return true
        return tier === s.targetAudience
      })
      .filter((s) => s.responses.length === 0)
      .map(({ responses: _r, ...survey }) => survey)

    return NextResponse.json({ surveys: active })
  } catch (error) {
    console.error("[SURVEYS GET]", error)
    return NextResponse.json({ error: "Failed to fetch surveys" }, { status: 500 })
  }
}
