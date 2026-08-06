import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { parseNewsletterSections } from "@/lib/newsletter"

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
        status: "sent",
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Enrich news cards
    const sections = parseNewsletterSections(campaign.sections)
    const enriched = await Promise.all(
      sections.map(async (section) => {
        if (section.type !== "news_card") return section
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
        sections: enriched,
      },
    })
  } catch (err) {
    console.error("[NEWSLETTER DETAIL API]", err)
    return NextResponse.json({ error: "Failed to load newsletter" }, { status: 500 })
  }
}
