import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

function prismaErrorResponse(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2021: table does not exist — schema not migrated on this database
    if (error.code === "P2021") {
      console.error("[OPPORTUNITIES API] Missing table:", error.meta)
      return NextResponse.json(
        {
          error: "Opportunities are not available yet (database setup pending).",
          code: "SCHEMA_PENDING",
          hint: "Run npm run db:apply-community-opportunities or apply prisma/migrations/20260603140000_community_opportunities/APPLY_IN_NEON_CONSOLE.sql in Neon.",
        },
        { status: 503 }
      )
    }
  }

  console.error("[OPPORTUNITIES API]", error)
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Failed to load opportunities" },
    { status: 500 }
  )
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100)
    const offset = parseInt(searchParams.get("offset") || "0", 10)
    const tag = searchParams.get("tag")
    const search = searchParams.get("search")?.trim()
    const featured = searchParams.get("featured") === "true"

    const where: Prisma.CommunityOpportunityWhereInput = {
      deletedAt: null,
      status: { in: ["open", "closed"] },
    }

    if (featured) where.featured = true
    if (tag) where.tags = { has: tag }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { source: { contains: search, mode: "insensitive" } },
      ]
    }

    const [opportunities, total] = await Promise.all([
      prisma.communityOpportunity.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          summary: true,
          flierUrl: true,
          applyUrl: true,
          tags: true,
          source: true,
          status: true,
          featured: true,
          deadline: true,
          publishedAt: true,
          createdAt: true,
        },
      }),
      prisma.communityOpportunity.count({ where }),
    ])

    const allTags = await prisma.communityOpportunity.findMany({
      where: { deletedAt: null, status: { in: ["open", "closed"] } },
      select: { tags: true },
    })
    const tagSet = new Set<string>()
    for (const row of allTags) {
      for (const t of row.tags) tagSet.add(t)
    }

    return NextResponse.json({
      opportunities,
      total,
      tags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)),
    })
  } catch (error) {
    return prismaErrorResponse(error)
  }
}
