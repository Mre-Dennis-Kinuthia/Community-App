import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { corsHeaders, handleOptions } from "@/middleware-cors"
import { resolveUserIdFromSession } from "@/lib/resolve-session-user"
import { findLinkedExpert, serializeLinkedExpert } from "@/lib/experts-server"

export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Sign in required" },
        { status: 401, headers: corsHeaders(request) }
      )
    }
    const userId = await resolveUserIdFromSession(session)
    if (!userId) {
      return NextResponse.json(
        { error: "Could not resolve your member account" },
        { status: 401, headers: corsHeaders(request) }
      )
    }

    const expert = await findLinkedExpert(userId, session.user.email)
    if (!expert) {
      return NextResponse.json({ expert: null }, { headers: corsHeaders(request) })
    }

    return NextResponse.json(
      { expert: serializeLinkedExpert(expert) },
      { headers: corsHeaders(request) }
    )
  } catch (error: unknown) {
    console.error("[EXPERT ME]", error)
    return NextResponse.json(
      { error: "Failed to load expert profile" },
      { status: 500, headers: corsHeaders(request) }
    )
  }
}
