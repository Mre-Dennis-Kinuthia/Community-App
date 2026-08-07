import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseNewsletterSections } from "@/lib/newsletter"
import type { NewsletterSection } from "@/lib/newsletter"

async function enrichSections(
  sections: NewsletterSection[]
): Promise<NewsletterSection[]> {
  return Promise.all(
    sections.map(async (section) => {
      if (section.type !== "news_card" || !section.newsPostId) return section
      const post = await prisma.newsPost.findFirst({
        where: {
          id: section.newsPostId,
          deletedAt: null,
          status: "published",
        },
        select: {
          id: true,
          title: true,
          excerpt: true,
          imageUrl: true,
          slug: true,
        },
      })
      if (!post) return section
      return {
        ...section,
        title: section.title || post.title,
        excerpt: section.excerpt || post.excerpt || undefined,
        imageUrl: section.imageUrl || post.imageUrl || undefined,
        url: `/news/${post.slug || post.id}`,
      }
    })
  )
}

function coverFromSections(sections: NewsletterSection[]): string | null {
  for (const s of sections) {
    if (s.type === "hero" && s.imageUrl) return s.imageUrl
    if (s.type === "image" && s.imageUrl) return s.imageUrl
    if (s.type === "news_card" && s.imageUrl) return s.imageUrl
  }
  return null
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const campaign = await prisma.newsletterCampaign.findFirst({
      where: {
        slug,
        deletedAt: null,
        publishedToWeb: true,
        status: { in: ["sent", "sending"] },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const sections = await enrichSections(
      parseNewsletterSections(campaign.sections)
    )

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        title: campaign.title,
        slug: campaign.slug,
        subject: campaign.subject,
        preheader: campaign.preheader,
        brandPrimary: campaign.brandPrimary,
        brandAccent: campaign.brandAccent,
        sentAt: campaign.sentAt,
        coverImageUrl: coverFromSections(sections),
        // Web archive uses native sections — email HTML is for inbox fidelity only
        sections,
      },
    })
  } catch (err) {
    console.error("[NEWSLETTER DETAIL API]", err)
    return NextResponse.json({ error: "Failed to load newsletter" }, { status: 500 })
  }
}
