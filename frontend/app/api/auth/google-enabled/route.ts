import { NextResponse } from "next/server"

/** GET /api/auth/google-enabled — whether Google OAuth sign-in is configured */
export async function GET() {
  const enabled = Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
  )
  return NextResponse.json({ enabled })
}
