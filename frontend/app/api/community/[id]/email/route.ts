import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { connectionPairFilter } from "@/lib/connection-requests"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"
import { getCommunityMemberProfileUrl } from "@/lib/app-url"
import { isEmailConfigured, sendConnectedMemberMessageEmail } from "@/lib/email"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

const memberEmailSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(5000),
})

/**
 * POST /api/community/[id]/email
 * Send an email to a connected member (platform relay with reply-to).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recipientId } = await params
    const session = await auth()
    const senderId = await resolveUserIdFromSession(session)

    if (!senderId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
    }

    if (senderId === recipientId) {
      return NextResponse.json(
        { error: "You cannot email yourself" },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: "Email is not configured on this platform" },
        { status: 503, headers: corsHeaders }
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = memberEmailSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400, headers: corsHeaders }
      )
    }

    const connection = await prisma.connection.findFirst({
      where: {
        status: "accepted",
        ...connectionPairFilter(senderId, recipientId),
      },
      select: { id: true },
    })

    if (!connection) {
      return NextResponse.json(
        { error: "You can only email members you are connected with" },
        { status: 403, headers: corsHeaders }
      )
    }

    const [sender, recipient] = await Promise.all([
      prisma.user.findUnique({
        where: { id: senderId },
        select: { name: true, email: true },
      }),
      prisma.user.findUnique({
        where: { id: recipientId },
        select: { name: true, email: true },
      }),
    ])

    if (!sender?.email) {
      return NextResponse.json(
        { error: "Your account does not have an email address" },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!recipient?.email) {
      return NextResponse.json(
        { error: "This member does not have an email address on file" },
        { status: 400, headers: corsHeaders }
      )
    }

    const result = await sendConnectedMemberMessageEmail({
      to: recipient.email,
      toName: recipient.name,
      fromName: sender.name || "Community member",
      fromEmail: sender.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      senderProfileUrl: getCommunityMemberProfileUrl(senderId),
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 502, headers: corsHeaders }
      )
    }

    return NextResponse.json({ ok: true }, { headers: corsHeaders })
  } catch (error: unknown) {
    console.error("[COMMUNITY EMAIL API] Error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to send email", details: message },
      { status: 500, headers: corsHeaders }
    )
  }
}
