import { NextResponse } from "next/server"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { prisma } from "@/lib/prisma"
import { emptyListIfMissingTable, requireMemberUserId } from "@/lib/space/front-desk-api"

export async function GET() {
  if (!isFeatureEnabled("deliveryManagement")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const authResult = await requireMemberUserId()
    if ("response" in authResult) return authResult.response

    const deliveries = await prisma.delivery.findMany({
      where: { recipientUserId: authResult.userId },
      include: { location: { select: { id: true, name: true } } },
      orderBy: { receivedAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ deliveries })
  } catch (error) {
    const missingTable = emptyListIfMissingTable(error, { deliveries: [] })
    if (missingTable) return missingTable
    console.error("[DELIVERIES API GET]", error)
    return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 })
  }
}
