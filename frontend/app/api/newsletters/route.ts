import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

    const [campaigns, total] = await Promise.all([
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
        },
      }),
      prisma.newsletterCampaign.count({ where }),
    ])

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
