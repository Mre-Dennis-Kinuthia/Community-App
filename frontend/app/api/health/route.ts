import { NextResponse } from "next/server"

/** GET /api/health — CI and uptime checks */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "impact-hub-community-app",
    timestamp: new Date().toISOString(),
  })
}
