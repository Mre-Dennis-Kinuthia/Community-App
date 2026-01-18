import { NextResponse } from "next/server"

/**
 * Handle OPTIONS requests for CORS preflight
 * This is needed for browsers to make cross-origin requests
 */
export async function OPTIONS() {
  const adminAppUrl = process.env.ADMIN_APP_URL || process.env.NEXT_PUBLIC_ADMIN_APP_URL
  const allowedOrigins = [
    "http://localhost:3001",
    "https://impacthubnairobi-app-admin.vercel.app",
    adminAppUrl,
  ].filter(Boolean)

  // Get origin from request headers (browser sends this)
  // For now, we'll allow the known origins
  const origin = allowedOrigins[0] || "*"

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    },
  })
}
