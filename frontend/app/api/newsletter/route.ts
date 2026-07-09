import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import {
  sendNewsletterSubscribeEmail,
  sendNewsletterSubscribeStaffEmail,
  sendEmailInBackground,
} from "@/lib/email"
import { subscribeNewsletterEmail } from "@/lib/newsletter"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  source: z.string().trim().max(64).optional(),
})

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source } = schema.parse(body)

    const result = await subscribeNewsletterEmail({ email, source })

    if (result === "created" || result === "reactivated") {
      const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email },
        select: { unsubscribeToken: true },
      })

      sendEmailInBackground(
        () =>
          sendNewsletterSubscribeEmail({
            to: email,
            unsubscribeToken: subscriber?.unsubscribeToken,
          }),
        "newsletter-subscribe"
      )

      sendEmailInBackground(
        () => sendNewsletterSubscribeStaffEmail({ email }),
        "newsletter-subscribe-staff"
      )
    }

    return NextResponse.json(
      {
        success: true,
        status: result,
      },
      { headers: corsHeaders(request) }
    )
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
