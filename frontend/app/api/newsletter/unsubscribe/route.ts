import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { unsubscribeNewsletterByToken } from "@/lib/newsletter"

const schema = z.object({
  token: z.string().min(1),
})

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = schema.parse(body)
    const result = await unsubscribeNewsletterByToken(token)

    if (result === "not_found") {
      return NextResponse.json(
        { error: "Invalid unsubscribe link" },
        { status: 404, headers: corsHeaders(request) }
      )
    }

    return NextResponse.json(
      { success: true, status: result },
      { headers: corsHeaders(request) }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400, headers: corsHeaders(request) }
      )
    }
    console.error("[newsletter] Unsubscribe error:", error)
    return NextResponse.json(
      { error: "Failed to unsubscribe. Please try again." },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
