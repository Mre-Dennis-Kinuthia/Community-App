import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { notifyVisitorRegistered } from "@/lib/space/visitor-notify"
import { LocationResolutionError, resolveLocationId } from "@/lib/space/locations"
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

async function resolveUserId(session: Awaited<ReturnType<typeof auth>>) {
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  return user?.id ?? null
}

export async function GET() {
  if (!isFeatureEnabled("visitorManagement")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = await resolveUserId(session)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const visitors = await prisma.visitor.findMany({
      where: { hostUserId: userId },
      include: { location: { select: { id: true, name: true } } },
      orderBy: { expectedAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ visitors })
  } catch (error) {
    console.error("[VISITORS API GET]", error)
    return NextResponse.json({ error: "Failed to fetch visitors" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isFeatureEnabled("visitorManagement")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = await resolveUserId(session)
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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
        hostUserId: userId,
        expectedAt: body.expectedAt,
        purpose: body.purpose ?? null,
        locationId,
        createdBy: userId,
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
      hostUserId: userId,
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
    console.error("[VISITORS API POST]", error)
    return NextResponse.json({ error: "Failed to register visitor" }, { status: 500 })
  }
}
