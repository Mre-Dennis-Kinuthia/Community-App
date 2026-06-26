import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { notifyVisitorRegistered } from "@/lib/space/visitor-notify"
import { LocationResolutionError, resolveLocationId } from "@/lib/space/locations"
import { emptyListIfMissingTable, requireMemberUserId } from "@/lib/space/front-desk-api"
import { z } from "zod"

const visitorBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  expectedAt: z.string().transform((s) => new Date(s)),
  purpose: z.string().optional().nullable(),
  locationId: z.string().optional(),
  workspaceId: z.string().optional(),
})

export async function GET() {
  if (!isFeatureEnabled("visitorManagement")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const authResult = await requireMemberUserId()
    if ("response" in authResult) return authResult.response

    const visitors = await prisma.visitor.findMany({
      where: { hostUserId: authResult.userId },
      include: { location: { select: { id: true, name: true } } },
      orderBy: { expectedAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ visitors })
  } catch (error) {
    const missingTable = emptyListIfMissingTable(error, { visitors: [] })
    if (missingTable) return missingTable
    console.error("[VISITORS API GET]", error)
    return NextResponse.json({ error: "Failed to fetch visitors" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isFeatureEnabled("visitorManagement")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const authResult = await requireMemberUserId()
    if ("response" in authResult) return authResult.response

    const body = visitorBodySchema.parse(await request.json())
    const locationId = await resolveLocationId({
      locationId: body.locationId,
      workspaceId: body.workspaceId,
    })

    const visitor = await prisma.visitor.create({
      data: {
        name: body.name,
        email: body.email ?? null,
        phone: body.phone ?? null,
        company: body.company ?? null,
        hostUserId: authResult.userId,
        expectedAt: body.expectedAt,
        purpose: body.purpose ?? null,
        locationId,
        createdBy: authResult.userId,
        status: "expected",
      },
      include: {
        location: { select: { id: true, name: true } },
        host: { select: { id: true, name: true, email: true } },
      },
    })

    await notifyVisitorRegistered({
      id: visitor.id,
      name: visitor.name,
      company: visitor.company,
      purpose: visitor.purpose,
      expectedAt: visitor.expectedAt,
      hostUserId: authResult.userId,
      location: visitor.location,
    })

    return NextResponse.json({ visitor }, { status: 201 })
  } catch (error) {
    if (error instanceof LocationResolutionError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }
    const missingTable = emptyListIfMissingTable(error, { visitors: [] })
    if (missingTable) {
      return NextResponse.json(
        { error: "Visitor management is not set up on this database yet." },
        { status: 503 }
      )
    }
    console.error("[VISITORS API POST]", error)
    return NextResponse.json({ error: "Failed to register visitor" }, { status: 500 })
  }
}
