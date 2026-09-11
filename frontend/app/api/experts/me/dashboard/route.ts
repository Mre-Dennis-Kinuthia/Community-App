import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"
import { findLinkedExpert, serializeLinkedExpert } from "@/lib/experts-server"
import { mapPublicExpertEvent } from "@/lib/experts"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

function serializeMeeting(meeting: {
  id: string
  requesterName: string
  requesterEmail: string
  topic: string
  message: string
  preferredTimes: string | null
  scheduledAt: Date | null
  scheduledEndAt: Date | null
  agenda: string | null
  meetingFormat: string
  requestType: string
  status: string
  createdAt: Date
}) {
  return {
    id: meeting.id,
    requesterName: meeting.requesterName,
    requesterEmail: meeting.requesterEmail,
    topic: meeting.topic,
    message: meeting.message,
    preferredTimes: meeting.preferredTimes,
    scheduledAt: meeting.scheduledAt?.toISOString() ?? null,
    scheduledEndAt: meeting.scheduledEndAt?.toISOString() ?? null,
    agenda: meeting.agenda,
    meetingFormat: meeting.meetingFormat,
    requestType: meeting.requestType,
    status: meeting.status,
    createdAt: meeting.createdAt.toISOString(),
  }
}

export async function GET(request: NextRequest) {
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
        { error: "This dashboard is for Experts in Residence" },
        { status: 403, headers: corsHeaders(request) }
      )
    }

    const [meetings, events] = await Promise.all([
      prisma.expertMeetingRequest.findMany({
        where: { expertId: expert.id },
        orderBy: { createdAt: "desc" },
        take: 80,
      }),
      prisma.event.findMany({
        where: { expertId: expert.id, deletedAt: null },
        orderBy: { startDate: "desc" },
        take: 40,
        include: {
          registrations: {
            where: { status: { not: "cancelled" } },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
    ])

    const clinics = meetings.filter((m) => m.requestType !== "services")
    const services = meetings.filter((m) => m.requestType === "services")
    const now = new Date()
    const upcomingEvents = events.filter((event) => event.startDate >= now)
    const totalGuests = events.reduce((sum, event) => sum + event.registrations.length, 0)

    return NextResponse.json(
      {
        expert: serializeLinkedExpert(expert),
        stats: {
          clinicPending: clinics.filter((m) => m.status === "pending").length,
          servicesPending: services.filter((m) => m.status === "pending").length,
          clinicsTotal: clinics.length,
          servicesTotal: services.length,
          upcomingEvents: upcomingEvents.length,
          totalGuests,
        },
        clinics: clinics.map(serializeMeeting),
        services: services.map(serializeMeeting),
        events: events.map((event) => ({
          ...mapPublicExpertEvent(event),
          registrationsCount: event.registrations.length,
          guests: event.registrations.map((reg) => ({
            id: reg.id,
            name: reg.name,
            email: reg.email,
            status: reg.status,
            createdAt: reg.createdAt.toISOString(),
          })),
        })),
      },
      { headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    console.error("[EIR DASHBOARD]", error)
    return NextResponse.json(
      { error: "Failed to load Expert in Residence dashboard" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
