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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const project = await prisma.project.findUnique({
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

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404, headers: corsHeaders }
      )
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
