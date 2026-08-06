import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** 1x1 transparent GIF */
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
)

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params
    const send = await prisma.newsletterSend.findUnique({
      where: { trackingToken: token },
      select: {
        id: true,
        campaignId: true,
        openedAt: true,
      },
    })

    if (send && !send.openedAt) {
      await prisma.$transaction([
        prisma.newsletterSend.update({
          where: { id: send.id },
          data: { openedAt: new Date() },
        }),
        prisma.newsletterEvent.create({
          data: { sendId: send.id, type: "open" },
        }),
        prisma.newsletterCampaign.update({
          where: { id: send.campaignId },
          data: { openCount: { increment: 1 } },
        }),
      ])
    } else if (send) {
      await prisma.newsletterEvent.create({
        data: { sendId: send.id, type: "open" },
      })
    }
  } catch (err) {
    console.error("[newsletter open track]", err)
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  })
}
