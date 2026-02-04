import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Use findFirst so we can safely filter on deletedAt as well
    const event = await prisma.event.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

    return NextResponse.json(
      { event },
      { headers: corsHeaders(request) }
    )
  } catch (error: any) {
    console.error("[EVENTS API] Error fetching event by id:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch event",
        details: error?.message || "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}

