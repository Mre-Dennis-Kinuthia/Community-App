import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { createNotification } from "@/lib/notifications"
import { sendEmail, sendEmailInBackground } from "@/lib/email/send"
import { z } from "zod"

const visitorBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  expectedAt: z.string().transform((s) => new Date(s)),
  purpose: z.string().optional().nullable(),
  locationId: z.string().optional(),
})

async function resolveUserId(session: Awaited<ReturnType<typeof auth>>) {
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  return user?.id ?? null
}

async function notifyHostVisitorRegistered(
  hostUserId: string,
  visitorName: string,
  expectedAt: Date
) {
  const host = await prisma.user.findUnique({
    where: { id: hostUserId },
    select: { email: true, name: true },
  })
  const when = expectedAt.toLocaleString("en-KE")

  await createNotification({
    userId: hostUserId,
    title: "Visitor registered",
    message: `${visitorName} is expected on ${when}.`,
    type: "info",
    category: "visitor",
    actionUrl: "/dashboard",
  })

  if (host?.email) {
    sendEmailInBackground(
      () =>
        sendEmail({
          to: host.email!,
          subject: "Impact Hub Nairobi — Visitor registered",
          html: `<p>Hi ${host.name || "there"},</p>
<p><strong>${visitorName}</strong> has been registered as your visitor, expected on ${when}.</p>`,
          text: `Visitor ${visitorName} expected on ${when}.`,
        }),
      "visitor-registered"
    )
  }
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
    let locationId = body.locationId
    if (!locationId) {
      const loc = await prisma.location.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      })
      if (!loc) {
        return NextResponse.json({ error: "No active location configured" }, { status: 400 })
      }
      locationId = loc.id
    }

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
      include: { location: { select: { id: true, name: true } } },
    })

    await notifyHostVisitorRegistered(userId, visitor.name, visitor.expectedAt)

    return NextResponse.json({ visitor }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }
    console.error("[VISITORS API POST]", error)
    return NextResponse.json({ error: "Failed to register visitor" }, { status: 500 })
  }
}
