import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

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

    const where: Record<string, unknown> = {
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
    console.error("[OPPORTUNITIES API]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load opportunities" },
      { status: 500 }
    )
  }
}
