import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { corsHeaders, handleOptions } from "@/middleware-cors"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * GET /api/projects
 * Get all projects with filtering. Only approved projects are visible on the community.
 * Use ?mine=1 when authenticated to get the current user's submissions (any status).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const stage = searchParams.get("stage") || ""
    const location = searchParams.get("location") || ""
    const featured = searchParams.get("featured") === "true"
    const mine = searchParams.get("mine") === "1" || searchParams.get("mine") === "true"
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {
      deletedAt: null,
      ...(mine ? {} : { status: "approved" }), // Only show approved on community; mine shows all statuses
    }

    if (mine) {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401, headers: corsHeaders }
        )
      }
      where.founderId = session.user.id
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (stage) {
      where.stage = stage
    }

    if (location) {
      where.location = location
    }

    if (featured) {
      where.isFeatured = true
    }

    const [rawProjects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          founder: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              followers: true,
              volunteers: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ])

    const founder = (p: (typeof rawProjects)[0]) =>
      p.founder as { id: string; name: string | null; image: string | null } | null

    const projects = rawProjects.map((p) => {
      const f = founder(p)
      return {
        id: p.id,
        title: p.title,
        description: p.description ?? "",
        category: p.category ?? null,
        stage: p.stage ?? null,
        impact: p.impact ?? null,
        imageUrl: p.imageUrl ?? null,
        location: p.location ?? null,
        website: p.website ?? null,
        tags: Array.isArray(p.tags) ? p.tags : [],
        needs: Array.isArray(p.needs) ? p.needs : [],
        isFeatured: Boolean(p.isFeatured),
        status: p.status ?? "approved",
        founder: f?.name ?? null,
        founderAvatar: f?.image ?? null,
        followers: typeof p._count?.followers === "number" ? p._count.followers : 0,
        volunteers: typeof p._count?.volunteers === "number" ? p._count.volunteers : 0,
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
        updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
        submittedAt: p.submittedAt ? (p.submittedAt instanceof Date ? p.submittedAt.toISOString() : p.submittedAt) : null,
        launchDate: p.launchDate ? (p.launchDate instanceof Date ? p.launchDate.toISOString() : p.launchDate) : null,
      }
    })

    return NextResponse.json(
      {
        projects,
        total: Number(total),
        limit,
        offset,
      },
      { headers: corsHeaders }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[PROJECTS API] Error:", error)
    const isUnavailable =
      /DATABASE_URL|not available|Prisma Client|ECONNREFUSED|connection/i.test(message)
    return NextResponse.json(
      {
        error: isUnavailable ? "Service temporarily unavailable. Please try again." : "Failed to fetch projects",
      },
      { status: isUnavailable ? 503 : 500, headers: corsHeaders }
    )
  }
}

/**
 * POST /api/projects
 * Submit a new project (member). Creates with status "pending" until admin approves.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const title = typeof body.title === "string" ? body.title.trim() : ""
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400, headers: corsHeaders }
      )
    }

    const imageUrl =
      body.imageUrl && typeof body.imageUrl === "string" && body.imageUrl.trim()
        ? body.imageUrl.trim()
        : null

    const project = await prisma.project.create({
      data: {
        title,
        description: typeof body.description === "string" ? body.description.trim() || "" : "",
        category: body.category ?? null,
        stage: body.stage ?? null,
        impact: body.impact ?? null,
        imageUrl,
        location: body.location ?? null,
        needs: Array.isArray(body.needs) ? body.needs : [],
        tags: Array.isArray(body.tags) ? body.tags : [],
        website: body.website && typeof body.website === "string" && body.website.trim() ? body.website.trim() : null,
        launchDate: body.launchDate ? new Date(body.launchDate) : null,
        founderId: session.user.id,
        status: "pending",
        submittedAt: new Date(),
      },
    })

    return NextResponse.json(
      { project: { id: project.id, title: project.title, status: project.status } },
      { status: 201, headers: corsHeaders }
    )
  } catch (error: any) {
    console.error("[PROJECTS API] POST Error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to submit project" },
      { status: 500, headers: corsHeaders }
    )
  }
}
