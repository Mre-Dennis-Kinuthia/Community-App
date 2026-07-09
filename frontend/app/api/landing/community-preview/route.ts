import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/landing/community-preview
 * Public snapshot for the marketing landing page — counts and featured members.
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date()

    const profileCompleteWhere = {
      memberType: { not: null },
      role: { not: null },
      industry: { not: null },
    }

    const [memberCount, upcomingEventsCount, featuredUsers, fallbackUsers] =
      await Promise.all([
        prisma.memberProfile.count({ where: profileCompleteWhere }),
        prisma.event.count({
          where: {
            deletedAt: null,
            visibility: "public",
            startDate: { gte: now },
          },
        }),
        prisma.user.findMany({
          where: { profile: { isFeatured: true, ...profileCompleteWhere } },
          take: 4,
          orderBy: { updatedAt: "desc" },
          select: {
            name: true,
            image: true,
            profile: {
              select: { role: true, industry: true, organization: true },
            },
          },
        }),
        prisma.user.findMany({
          where: { profile: profileCompleteWhere },
          take: 4,
          orderBy: { createdAt: "desc" },
          select: {
            name: true,
            image: true,
            profile: {
              select: { role: true, industry: true, organization: true },
            },
          },
        }),
      ])

    const membersSource = featuredUsers.length > 0 ? featuredUsers : fallbackUsers

    const featuredMembers = membersSource
      .filter((user) => user.name?.trim())
      .map((user) => ({
        name: user.name!.trim(),
        image: user.image,
        role: user.profile?.role ?? null,
        industry: user.profile?.industry ?? null,
        organization: user.profile?.organization ?? null,
      }))

    return NextResponse.json(
      {
        memberCount,
        upcomingEventsCount,
        featuredMembers,
      },
      { headers: corsHeaders(request) }
    )
  } catch (error) {
    console.error("[LANDING COMMUNITY PREVIEW]", error)
    return NextResponse.json(
      {
        memberCount: 0,
        upcomingEventsCount: 0,
        featuredMembers: [],
      },
      { headers: corsHeaders(request) }
    )
  }
}
