import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export type SearchResultType =
  | "event"
  | "member"
  | "project"
  | "partner"
  | "resource"
  | "news"

export interface SearchResultItem {
  id: string
  title: string
  type: SearchResultType
  href: string
  description?: string
}

const MAX_PER_TYPE = 5

/**
 * GET /api/search?q=...
 * Published/public content only; member names without email (authenticated).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const q = request.nextUrl.searchParams.get("q")?.trim() ?? ""
    if (q.length < 2) {
      return NextResponse.json({ results: [] as SearchResultItem[] })
    }

    const contains = { contains: q, mode: "insensitive" as const }

    const [news, events, projects, partners, resources, members] = await Promise.all([
      prisma.newsPost.findMany({
        where: {
          status: "published",
          deletedAt: null,
          OR: [{ title: contains }, { excerpt: contains }],
        },
        select: { id: true, title: true, excerpt: true, slug: true },
        take: MAX_PER_TYPE,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.event.findMany({
        where: {
          deletedAt: null,
          OR: [{ title: contains }, { description: contains }],
        },
        select: { id: true, title: true, description: true },
        take: MAX_PER_TYPE,
        orderBy: { startDate: "asc" },
      }),
      prisma.project.findMany({
        where: {
          deletedAt: null,
          status: "approved",
          OR: [{ title: contains }, { description: contains }],
        },
        select: { id: true, title: true, description: true },
        take: MAX_PER_TYPE,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.partner.findMany({
        where: {
          deletedAt: null,
          OR: [{ name: contains }, { description: contains }],
        },
        select: { id: true, name: true, description: true },
        take: MAX_PER_TYPE,
        orderBy: { name: "asc" },
      }),
      prisma.resource.findMany({
        where: {
          deletedAt: null,
          OR: [{ title: contains }, { description: contains }],
        },
        select: { id: true, title: true, description: true },
        take: MAX_PER_TYPE,
        orderBy: { title: "asc" },
      }),
      prisma.user.findMany({
        where: {
          name: contains,
          profile: { isNot: null },
        },
        select: { id: true, name: true, profile: { select: { bio: true, industry: true } } },
        take: MAX_PER_TYPE,
      }),
    ])

    const results: SearchResultItem[] = [
      ...news.map((n) => ({
        id: n.id,
        title: n.title,
        type: "news" as const,
        href: `/news/${n.slug || n.id}`,
        description: n.excerpt?.slice(0, 120) || undefined,
      })),
      ...events.map((e) => ({
        id: e.id,
        title: e.title,
        type: "event" as const,
        href: `/events/${e.id}`,
        description: e.description?.slice(0, 120) || undefined,
      })),
      ...projects.map((p) => ({
        id: p.id,
        title: p.title,
        type: "project" as const,
        href: `/projects/${p.id}`,
        description: p.description?.slice(0, 120) || undefined,
      })),
      ...partners.map((p) => ({
        id: p.id,
        title: p.name,
        type: "partner" as const,
        href: `/partners/${p.id}`,
        description: p.description?.slice(0, 120) || undefined,
      })),
      ...resources.map((r) => ({
        id: r.id,
        title: r.title,
        type: "resource" as const,
        href: `/resources/${r.id}`,
        description: r.description?.slice(0, 120) || undefined,
      })),
      ...members
        .filter((m) => m.name)
        .map((m) => ({
          id: m.id,
          title: m.name!,
          type: "member" as const,
          href: `/community/${m.id}`,
          description: m.profile?.industry || m.profile?.bio?.slice(0, 120) || undefined,
        })),
    ]

    return NextResponse.json({ results: results.slice(0, 20) })
  } catch (error) {
    console.error("[SEARCH API] Error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
