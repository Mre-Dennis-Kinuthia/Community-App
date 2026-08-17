import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { checkBookingSlotAvailable } from "@/lib/booking-slot"

const verifySchema = z.object({
  resourceType: z.enum(["hot-desk", "meeting-room", "private-office", "event-space"]),
  date: z.string().transform((str) => new Date(str)),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  duration: z.enum(["hourly", "half-day", "full-day", "monthly"]),
  meetingRoomHours: z.number().min(1).max(8).optional(),
  workspaceId: z.string().default("impact-hub-nairobi"),
  spaceAssetId: z.string().optional(),
})

async function resolveUserIdFromSession(session: Awaited<ReturnType<typeof auth>>) {
  const sessionUser = session?.user
  if (!sessionUser) return null

  if (typeof sessionUser.id === "string") {
    const existing = await prisma.user.findUnique({ where: { id: sessionUser.id } })
    if (existing) return existing.id
  }

  const email = typeof sessionUser.email === "string" ? sessionUser.email.toLowerCase().trim() : null
  if (!email) return null

  const upserted = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: typeof sessionUser.name === "string" ? sessionUser.name : null,
      image: typeof (sessionUser as { image?: string }).image === "string" ? (sessionUser as { image?: string }).image : null,
    },
    update: {
      name: typeof sessionUser.name === "string" ? sessionUser.name : undefined,
      image: typeof (sessionUser as { image?: string }).image === "string" ? (sessionUser as { image?: string }).image : undefined,
    },
  })

  return upserted.id
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in to book a workspace." }, { status: 401 })
    }

    const userId = await resolveUserIdFromSession(session)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please log in to book a workspace." }, { status: 401 })
    }

    const body = await request.json()
    const validated = verifySchema.parse(body)

    const result = await checkBookingSlotAvailable(prisma, {
      userId,
      resourceType: validated.resourceType,
      date: validated.date,
      startTime: validated.startTime,
      duration: validated.duration,
      meetingRoomHours: validated.meetingRoomHours,
      workspaceId: validated.workspaceId,
      spaceAssetId: validated.spaceAssetId,
    })

    if (!result.available) {
      return NextResponse.json({ available: false, reason: result.reason })
    }

    return NextResponse.json({ available: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid booking details", details: error.errors }, { status: 400 })
    }
    console.error("[VERIFY AVAILABILITY] Error:", error)
    return NextResponse.json({ error: "Failed to verify availability" }, { status: 500 })
  }
}
