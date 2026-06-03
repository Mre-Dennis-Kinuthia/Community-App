import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { opportunityApplyEnabled, opportunityIsVisible } from "@/lib/community-opportunity"

function prismaErrorResponse(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
    return NextResponse.json(
      {
        error: "Opportunities are not available yet (database setup pending).",
        code: "SCHEMA_PENDING",
      },
      { status: 503 }
    )
  }
  console.error("[OPPORTUNITY DETAIL API]", error)
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Failed to load opportunity" },
    { status: 500 }
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const opportunity = await prisma.communityOpportunity.findFirst({
      where: { id, deletedAt: null },
    })

    if (!opportunity || !opportunityIsVisible(opportunity.status)) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    return NextResponse.json({
      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        summary: opportunity.summary,
        content: opportunity.content,
        flierUrl: opportunity.flierUrl,
        applyUrl: opportunity.applyUrl,
        tags: opportunity.tags,
        source: opportunity.source,
        status: opportunity.status,
        featured: opportunity.featured,
        deadline: opportunity.deadline,
        publishedAt: opportunity.publishedAt,
        canApply: opportunityApplyEnabled(
          opportunity.status,
          opportunity.deadline ? new Date(opportunity.deadline) : null
        ),
      },
    })
  } catch (error) {
    return prismaErrorResponse(error)
  }
}
