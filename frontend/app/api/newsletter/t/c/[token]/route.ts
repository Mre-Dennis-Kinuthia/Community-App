import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAppBaseUrl } from "@/lib/app-url"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params
  const dest = request.nextUrl.searchParams.get("u") || getAppBaseUrl()

  let safeUrl = getAppBaseUrl()
  try {
    const parsed = new URL(dest, getAppBaseUrl())
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      safeUrl = parsed.toString()
    }
  } catch {
    // keep fallback
  }

  try {
    const send = await prisma.newsletterSend.findUnique({
      where: { trackingToken: token },
      select: { id: true, campaignId: true },
    })
    if (send) {
      await prisma.$transaction([
        prisma.newsletterSend.update({
          where: { id: send.id },
          data: { clickCount: { increment: 1 } },
        }),
        prisma.newsletterEvent.create({
          data: { sendId: send.id, type: "click", url: safeUrl },
        }),
        prisma.newsletterCampaign.update({
          where: { id: send.campaignId },
          data: { clickCount: { increment: 1 } },
        }),
      ])
    }
  } catch (err) {
    console.error("[newsletter click track]", err)
  }

  return NextResponse.redirect(safeUrl, 302)
}
