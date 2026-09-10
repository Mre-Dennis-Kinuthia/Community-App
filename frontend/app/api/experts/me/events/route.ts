import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"
import { findLinkedExpert } from "@/lib/experts-server"
import { expertEventCreateSchema, mapPublicExpertEvent, normalizeTagList } from "@/lib/experts"
import { ensureEventSlugAndShortCode } from "@/lib/event-slug"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Sign in required" },
        { status: 401, headers: corsHeaders(request) }
      )
    }
    const userId = await resolveUserIdFromSession(session)
    if (!userId) {
      return NextResponse.json(
        { error: "Could not resolve your member account" },
        { status: 401, headers: corsHeaders(request) }
      )
    }

    const expert = await findLinkedExpert(userId, session.user.email)
    if (!expert || !expert.isPublished) {
      return NextResponse.json(
        { error: "Only published Experts in Residence can host virtual sessions" },
        { status: 403, headers: corsHeaders(request) }
      )
    }

    const body = expertEventCreateSchema.parse(await request.json())
    const startDate = new Date(`${body.startDate}:00+03:00`)
    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: "Choose a valid start time" },
        { status: 400, headers: corsHeaders(request) }
      )
    }
    const endDate = body.endDate ? new Date(`${body.endDate}:00+03:00`) : null
    if (endDate && Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: "Choose a valid end time" },
        { status: 400, headers: corsHeaders(request) }
      )
    }
    if (endDate && endDate <= startDate) {
      return NextResponse.json(
        { error: "End time must be after the start time" },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    const onlineUrl = body.onlineUrl?.trim() || null
    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        startDate,
        endDate: endDate ?? startDate,
        location: "Online",
        locationType: "online",
        onlineUrl,
        eventType: "seminar",
        timezone: "Africa/Nairobi",
        visibility: body.visibility,
        organizerName: expert.name,
        organizerEmail: expert.email,
        tags: ["experts-in-residence", ...normalizeTagList(body.tags)],
        expertId: expert.id,
        registrationRequired: true,
        allowJoinWithoutOnboarding: true,
      },
    })

    await ensureEventSlugAndShortCode(prisma, event)

    const created = await prisma.event.findFirstOrThrow({ where: { id: event.id } })

    return NextResponse.json(
      { event: mapPublicExpertEvent(created) },
      { status: 201, headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid session details" },
        { status: 400, headers: corsHeaders(request) }
      )
    }
    console.error("[EXPERT EVENT CREATE]", error)
    return NextResponse.json(
      { error: "Failed to create virtual session" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
