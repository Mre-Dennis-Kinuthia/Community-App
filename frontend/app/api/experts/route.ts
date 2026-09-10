import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { mapPublicExpert } from "@/lib/experts"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || ""
    const expertise = searchParams.get("expertise")?.trim() || ""
    const initiative = searchParams.get("initiative")?.trim() || ""
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "100", 10), 1), 200)
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0)

    const where: {
      deletedAt: null
      isPublished: true
      expertise?: { has: string }
      initiatives?: { has: string }
      OR?: Array<
        | { name: { contains: string; mode: "insensitive" } }
        | { title: { contains: string; mode: "insensitive" } }
        | { bio: { contains: string; mode: "insensitive" } }
        | { organization: { contains: string; mode: "insensitive" } }
        | { expertise: { has: string } }
        | { initiatives: { has: string } }
      >
    } = {
      deletedAt: null,
      isPublished: true,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
        { expertise: { has: search } },
        { initiatives: { has: search } },
      ]
    }
    if (expertise) where.expertise = { has: expertise }
    if (initiative) where.initiatives = { has: initiative }

    const now = new Date()
    const [rows, total, allPublished] = await Promise.all([
      prisma.expertInResidence.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: {
              events: { where: { deletedAt: null, startDate: { gte: now } } },
            },
          },
        },
      }),
      prisma.expertInResidence.count({ where }),
      prisma.expertInResidence.findMany({
        where: { deletedAt: null, isPublished: true },
        select: { expertise: true, initiatives: true },
      }),
    ])

    const expertiseSet = new Set<string>()
    const initiativeSet = new Set<string>()
    for (const row of allPublished) {
      row.expertise.forEach((tag) => expertiseSet.add(tag))
      row.initiatives.forEach((tag) => initiativeSet.add(tag))
    }

    return NextResponse.json(
      {
        experts: rows.map(mapPublicExpert),
        total,
        filters: {
          expertise: Array.from(expertiseSet).sort(),
          initiatives: Array.from(initiativeSet).sort(),
        },
      },
      { headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    console.error("[EXPERTS API]", error)
    return NextResponse.json(
      { error: "Failed to load experts" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
