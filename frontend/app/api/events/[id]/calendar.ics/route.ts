import { NextRequest, NextResponse } from "next/server"
import { buildIcsContent } from "@/lib/event-calendar"
import { findEventByPublicParam } from "@/lib/event-slug"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id: param } = await Promise.resolve(params)
    const event = await findEventByPublicParam(prisma, param)

    if (!event || event.deletedAt) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

    const ics = buildIcsContent({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      timezone: event.timezone,
      location: event.location,
      locationType: event.locationType,
      onlineUrl: event.onlineUrl,
      slug: event.slug,
      shortCode: event.shortCode,
    })

    const filename = `${event.slug || event.shortCode || event.id}.ics`

    return new NextResponse(ics, {
      status: 200,
      headers: {
        ...corsHeaders(request),
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("[EVENT CALENDAR ICS] Error:", error)
    return NextResponse.json(
      { error: "Failed to generate calendar file" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
