import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { z } from "zod"

const requestSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["internet", "cleaning", "printer", "hvac", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  locationId: z.string().optional(),
  spaceAssetId: z.string().optional().nullable(),
})

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

    const tickets = await prisma.maintenanceTicket.findMany({
      where: { reportedBy: userId },
      include: { location: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("[MAINTENANCE REQUESTS GET]", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isFeatureEnabled("operationsModule")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const userId = await resolveUserId(session)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = requestSchema.parse(await request.json())
    let locationId = body.locationId
    if (!locationId) {
      const loc = await prisma.location.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      })
      if (!loc) return NextResponse.json({ error: "No active location configured" }, { status: 400 })
      locationId = loc.id
    }

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        priority: body.priority ?? "medium",
        locationId,
        spaceAssetId: body.spaceAssetId ?? null,
        reportedBy: userId,
        status: "open",
      },
      include: { location: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }
    console.error("[MAINTENANCE REQUESTS POST]", error)
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 })
  }
}
