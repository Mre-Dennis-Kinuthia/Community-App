import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"
import {
  EXPERT_MEETING_TICKET_CATEGORY,
  expertPublicParamWhere,
  meetingRequestSchema,
} from "@/lib/experts"
import {
  sendExpertMeetingExpertEmail,
  sendExpertMeetingMemberEmail,
  sendExpertMeetingStaffEmail,
  type ExpertMeetingEmailPayload,
} from "@/lib/email/expert-meeting"
import { isEmailConfigured, sendEmailsInBackground } from "@/lib/email/send"
import { createNotification } from "@/lib/notifications"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Sign in to request a meeting" },
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

    const { id } = await params
    const expert = await prisma.expertInResidence.findFirst({
      where: {
        ...expertPublicParamWhere(id),
        deletedAt: null,
        isPublished: true,
      },
    })
    if (!expert) {
      return NextResponse.json(
        { error: "Expert not found" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

    const body = meetingRequestSchema.parse(await request.json())
    const requesterName =
      (typeof session.user.name === "string" && session.user.name.trim()) ||
      session.user.email ||
      "Community member"
    const requesterEmail =
      typeof session.user.email === "string" ? session.user.email.toLowerCase().trim() : ""
    if (!requesterEmail) {
      return NextResponse.json(
        { error: "Your account needs an email address to request a meeting" },
        { status: 400, headers: corsHeaders(request) }
      )
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        member: `${requesterName} <${requesterEmail}>`,
        subject: `Experts in Residence · Meeting — ${expert.name}`,
        description: [
          `Expert: ${expert.name} <${expert.email}>`,
          `Member: ${requesterName} <${requesterEmail}>`,
          `Topic: ${body.topic}`,
          `Format: ${body.meetingFormat}`,
          `Preferred times: ${body.preferredTimes?.trim() || "Flexible"}`,
          "",
          body.message,
        ].join("\n"),
        status: "open",
        priority: "medium",
        category: EXPERT_MEETING_TICKET_CATEGORY,
      },
    })

    const meeting = await prisma.expertMeetingRequest.create({
      data: {
        expertId: expert.id,
        requesterUserId: userId,
        requesterEmail,
        requesterName,
        topic: body.topic,
        message: body.message,
        preferredTimes: body.preferredTimes?.trim() || null,
        meetingFormat: body.meetingFormat,
        ticketId: ticket.id,
      },
    })

    const payload: ExpertMeetingEmailPayload = {
      expertName: expert.name,
      expertEmail: expert.email,
      expertSlug: expert.slug,
      requesterName,
      requesterEmail,
      topic: body.topic,
      message: body.message,
      preferredTimes: body.preferredTimes,
      meetingFormat: body.meetingFormat,
    }

    if (isEmailConfigured()) {
      sendEmailsInBackground([
        { send: () => sendExpertMeetingExpertEmail(payload), context: "expert-meeting-expert" },
        { send: () => sendExpertMeetingMemberEmail(payload), context: "expert-meeting-member" },
        { send: () => sendExpertMeetingStaffEmail(payload), context: "expert-meeting-staff" },
      ])
    }

    if (expert.userId) {
      await createNotification({
        userId: expert.userId,
        title: "New meeting request",
        message: `${requesterName} would like to meet about ${body.topic}.`,
        type: "info",
        category: "community",
        actionUrl: `/experts/${expert.slug}`,
        relatedId: meeting.id,
        relatedType: "expert_meeting",
        skipEmail: true,
      })
    }

    return NextResponse.json(
      { meeting: { id: meeting.id, status: meeting.status } },
      { status: 201, headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid meeting request" },
        { status: 400, headers: corsHeaders(request) }
      )
    }
    console.error("[EXPERT MEETING]", error)
    return NextResponse.json(
      { error: "Failed to send meeting request" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
