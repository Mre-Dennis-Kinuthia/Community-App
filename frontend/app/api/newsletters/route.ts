import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseNewsletterSections } from "@/lib/newsletter"
import type { NewsletterSection } from "@/lib/newsletter"

function coverFromSections(sections: NewsletterSection[]): string | null {
  for (const s of sections) {
    if (s.type === "hero" && s.imageUrl) return s.imageUrl
    if (s.type === "image" && s.imageUrl) return s.imageUrl
    if (s.type === "news_card" && s.imageUrl) return s.imageUrl
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 50)
    const skip = (page - 1) * limit

    const where = {
      deletedAt: null,
      publishedToWeb: true,
      status: "sent",
    }

    const [rows, total] = await Promise.all([
      prisma.newsletterCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sentAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          preheader: true,
          subject: true,
          sentAt: true,
          brandPrimary: true,
          sections: true,
        },
      }),
      prisma.newsletterCampaign.count({ where }),
    ])

    const campaigns = rows.map((c) => {
      const sections = parseNewsletterSections(c.sections)
      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        preheader: c.preheader,
        subject: c.subject,
        sentAt: c.sentAt,
        brandPrimary: c.brandPrimary,
        coverImageUrl: coverFromSections(sections),
      }
    })

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error("[NEWSLETTERS API]", err)
    return NextResponse.json(
      { error: "Failed to list newsletters" },
      { status: 500 }
    )
  }
}
