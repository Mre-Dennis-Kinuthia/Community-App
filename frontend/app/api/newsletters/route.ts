import { NextRequest, NextResponse } from "next/server"
import {
  coverFromSections,
  listPublishedCampaigns,
  parseCampaignSections,
} from "@/lib/newsletter/db"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 50)
    const skip = (page - 1) * limit

    const { rows, total } = await listPublishedCampaigns({ skip, limit })

    const campaigns = rows.map((c) => {
      const sections = parseCampaignSections(c.sections)
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
    const detail = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        error: "Failed to list newsletters",
        ...(process.env.NODE_ENV !== "production" ? { detail } : {}),
      },
      { status: 500 }
    )
  }
}
