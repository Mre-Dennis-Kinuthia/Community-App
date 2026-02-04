import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/projects/[id]
 * Get a single project with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const raw = await prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        founder: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            profile: {
              select: {
                bio: true,
                role: true,
                industry: true,
              },
            },
          },
        },
        _count: {
          select: {
            followers: true,
            volunteers: true,
            collaborationRequests: true,
          },
        },
      },
    })

    if (!raw) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404, headers: corsHeaders }
      )
    }

    const socialLinks = (raw.socialLinks as Record<string, string> | null) ?? {}
    const metrics = (raw.metrics as Record<string, number | string> | null) ?? {}

    const project = {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      fullDescription: raw.description,
      category: raw.category,
      stage: raw.stage,
      impact: raw.impact,
      location: raw.location,
      website: raw.website,
      launchDate: raw.launchDate,
      founder: raw.founder?.name ?? null,
      founderAvatar: raw.founder?.image ?? null,
      email: raw.founder?.email ?? null,
      followers: raw._count?.followers ?? 0,
      volunteers: raw._count?.volunteers ?? 0,
      collaborationRequests: raw._count?.collaborationRequests ?? 0,
      featured: raw.isFeatured,
      socialLinks: {
        linkedin: socialLinks.linkedin ?? null,
        twitter: socialLinks.twitter ?? null,
      },
      metrics,
      team: [],
      milestones: [],
      tags: raw.tags ?? [],
      needs: raw.needs ?? [],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }

    return NextResponse.json({ project }, { headers: corsHeaders })
  } catch (error: any) {
    console.error("[PROJECT API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500, headers: corsHeaders }
    )
  }
}
