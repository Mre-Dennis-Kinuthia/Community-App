import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const now = new Date()
    const posts = await prisma.newsPost.findMany({
      where: {
        status: "published",
        deletedAt: null,
        OR: [
          { announcementType: "urgent" },
          {
            announcementType: "pinned",
            OR: [{ pinUntil: null }, { pinUntil: { gte: now } }],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        announcementType: true,
        publishedAt: true,
        pinUntil: true,
      },
      orderBy: [{ announcementType: "desc" }, { publishedAt: "desc" }],
      take: 5,
    })

    return NextResponse.json({ announcements: posts })
  } catch (error) {
    console.error("[ANNOUNCEMENTS GET]", error)
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 })
  }
}
