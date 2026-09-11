import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"
import {
  EIR_DASHBOARD_PATH,
  EXPERT_MEETING_TICKET_CATEGORY,
  expertPublicParamWhere,
  expertRequestTypeLabel,
  generateSessionAgenda,
  meetingRequestSchema,
} from "@/lib/experts"
import {
  findMatchingSlot,
  generateBookableSlots,
} from "@/lib/expert-availability"
import { bookedRangesFromMeetings } from "@/lib/experts-server"
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

    let scheduledAt: Date | null = null
    let scheduledEndAt: Date | null = null
    let status = "pending"
    const requestedSlot = body.scheduledAt?.trim() || ""
    if (requestedSlot) {
      const slots = generateBookableSlots({
        windows: expert.availabilityWindows,
        durationMinutes: expert.sessionDurationMinutes,
        booked: bookedRangesFromMeetings(expert.meetings),
      })
      const match = findMatchingSlot(slots, requestedSlot)
      if (!match) {
        return NextResponse.json(
          { error: "That time is no longer available. Pick another slot." },
          { status: 409, headers: corsHeaders(request) }
        )
      }
      scheduledAt = new Date(match.start)
      scheduledEndAt = new Date(match.end)
      status = "confirmed"
    }

    const agenda = generateSessionAgenda({
      expertName: expert.name,
      expertTitle: expert.title,
      requesterName,
      topic: body.topic,
      message: body.message,
      requestType: body.requestType,
      meetingFormat: body.meetingFormat,
      durationMinutes: expert.sessionDurationMinutes,
      scheduledAt,
      scheduledEndAt,
    })

    const ticket = await prisma.supportTicket.create({
      data: {
        member: `${requesterName} <${requesterEmail}>`,
        subject: `Experts in Residence · ${expertRequestTypeLabel(body.requestType)} — ${expert.name}`,
        description: [
          `Expert: ${expert.name} <${expert.email}>`,
          `Member: ${requesterName} <${requesterEmail}>`,
          `Type: ${expertRequestTypeLabel(body.requestType)}`,
          `Topic: ${body.topic}`,
          `Format: ${body.meetingFormat}`,
          `Preferred times: ${body.preferredTimes?.trim() || "Flexible"}`,
          scheduledAt ? `Booked: ${scheduledAt.toISOString()}` : "",
          "",
          body.message,
          "",
          agenda,
        ]
          .filter((line) => line !== "")
          .join("\n"),
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
        scheduledAt,
        scheduledEndAt,
        agenda,
        meetingFormat: body.meetingFormat,
        requestType: body.requestType,
        status,
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
      scheduledAt: scheduledAt?.toISOString() ?? null,
      scheduledEndAt: scheduledEndAt?.toISOString() ?? null,
      agenda,
      meetingFormat: body.meetingFormat,
      requestType: body.requestType,
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
        title: scheduledAt
          ? `Session booked: ${body.topic}`
          : `New ${expertRequestTypeLabel(body.requestType).toLowerCase()} request`,
        message: scheduledAt
          ? `${requesterName} booked a session about ${body.topic}.`
          : `${requesterName} would like to meet about ${body.topic}.`,
        type: "info",
        category: "community",
        actionUrl: EIR_DASHBOARD_PATH,
        relatedId: meeting.id,
        relatedType: "expert_meeting",
        skipEmail: true,
      })
    }

    return NextResponse.json(
      {
        meeting: {
          id: meeting.id,
          status: meeting.status,
          scheduledAt: meeting.scheduledAt,
          agenda: meeting.agenda,
        },
      },
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
