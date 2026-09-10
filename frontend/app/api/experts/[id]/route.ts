import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import {
  expertPublicParamWhere,
  mapPublicExpert,
  mapPublicExpertEvent,
} from "@/lib/experts"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const now = new Date()

    const row = await prisma.expertInResidence.findFirst({
      where: {
        ...expertPublicParamWhere(id),
        deletedAt: null,
        isPublished: true,
      },
      include: {
        _count: {
          select: {
            events: { where: { deletedAt: null, startDate: { gte: now } } },
          },
        },
        events: {
          where: {
            deletedAt: null,
            startDate: { gte: now },
            visibility: { in: ["public", "members"] },
          },
          orderBy: { startDate: "asc" },
          take: 12,
        },
      },
    })

    if (!row) {
      return NextResponse.json(
        { error: "Expert not found" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

    return NextResponse.json(
      {
        expert: {
          ...mapPublicExpert(row),
          events: row.events.map(mapPublicExpertEvent),
        },
      },
      { headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    console.error("[EXPERT API]", error)
    return NextResponse.json(
      { error: "Failed to load expert" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
