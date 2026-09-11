import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { expertPublicParamWhere } from "@/lib/experts"
import { generateBookableSlots } from "@/lib/expert-availability"
import { bookedRangesFromMeetings } from "@/lib/experts-server"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const expert = await prisma.expertInResidence.findFirst({
      where: {
        ...expertPublicParamWhere(id),
        deletedAt: null,
        isPublished: true,
      },
      include: {
        availabilityWindows: true,
        meetings: {
          where: {
            scheduledAt: { not: null },
            status: { notIn: ["declined", "cancelled"] },
          },
          select: { scheduledAt: true, scheduledEndAt: true, status: true },
        },
      },
    })

    if (!expert) {
      return NextResponse.json(
        { error: "Expert not found" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

    const enabled = expert.availabilityEnabled && expert.availabilityWindows.length > 0
    const slots = enabled
      ? generateBookableSlots({
          windows: expert.availabilityWindows,
          durationMinutes: expert.sessionDurationMinutes,
          booked: bookedRangesFromMeetings(expert.meetings),
        })
      : []

    return NextResponse.json(
      {
        enabled,
        durationMinutes: expert.sessionDurationMinutes,
        timezone: "Africa/Nairobi",
        slots,
      },
      { headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    console.error("[EXPERT AVAILABILITY]", error)
    return NextResponse.json(
      { error: "Failed to load availability" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
