import { NextRequest, NextResponse } from "next/server"
import {
  coverFromSections,
  enrichNewsletterSections,
  getPublishedCampaignBySlug,
  parseCampaignSections,
} from "@/lib/newsletter/db"

export const runtime = "nodejs"

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const campaign = await getPublishedCampaignBySlug(slug)

    if (!campaign) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const sections = await enrichNewsletterSections(
      parseCampaignSections(campaign.sections)
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
        sections,
      },
    })
  } catch (err) {
    console.error("[NEWSLETTER DETAIL API]", err)
    const detail = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        error: "Failed to load newsletter",
        ...(process.env.NODE_ENV !== "production" ? { detail } : {}),
      },
      { status: 500 }
    )
  }
}
