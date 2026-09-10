import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"
import { findLinkedExpert } from "@/lib/experts-server"
import { EXPERT_MEETING_STATUSES } from "@/lib/experts"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const schema = z.object({
  status: z.enum(EXPERT_MEETING_STATUSES),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: "Could not resolve your account" },
        { status: 401, headers: corsHeaders(request) }
      )
    }

    const expert = await findLinkedExpert(userId, session.user.email)
    if (!expert) {
      return NextResponse.json(
        { error: "This action is for Experts in Residence" },
        { status: 403, headers: corsHeaders(request) }
      )
    }

    const { id } = await params
    const meeting = await prisma.expertMeetingRequest.findFirst({
      where: { id, expertId: expert.id },
    })
    if (!meeting) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

    const data = schema.parse(await request.json())
    const updated = await prisma.expertMeetingRequest.update({
      where: { id: meeting.id },
      data: { status: data.status },
    })

    return NextResponse.json(
      {
        meeting: {
          id: updated.id,
          status: updated.status,
          requestType: updated.requestType,
        },
      },
      { headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid status" },
        { status: 400, headers: corsHeaders(request) }
      )
    }
    console.error("[EIR MEETING PATCH]", error)
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
