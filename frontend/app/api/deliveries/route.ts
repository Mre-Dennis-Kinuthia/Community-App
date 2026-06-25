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
  if (!isFeatureEnabled("deliveryManagement")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = await resolveUserId(session)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const deliveries = await prisma.delivery.findMany({
      where: { recipientUserId: userId },
      include: { location: { select: { id: true, name: true } } },
      orderBy: { receivedAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ deliveries })
  } catch (error) {
    console.error("[DELIVERIES API GET]", error)
    return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 })
  }
}
