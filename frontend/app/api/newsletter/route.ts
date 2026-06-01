import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { sendNewsletterSubscribeEmail, sendEmailInBackground } from "@/lib/email"

const schema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
})

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    // TODO: add a NewsletterSubscriber Prisma model to persist subscribers.
    console.log("[newsletter] New subscriber:", email)

    sendEmailInBackground(
      sendNewsletterSubscribeEmail({ to: email }),
      "newsletter-subscribe"
    )

    return NextResponse.json({ success: true }, { headers: corsHeaders(request) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400, headers: corsHeaders(request) }
      )
    }
    console.error("[newsletter] Subscribe error:", error)
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
