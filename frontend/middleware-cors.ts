import { NextRequest, NextResponse } from "next/server"

/**
 * CORS middleware for admin API routes
 * Handles preflight OPTIONS requests and adds CORS headers
 */
export function corsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin")
  
  // Allowed origins
  const allowedOrigins = [
    "http://localhost:3001",
    "https://impacthubnairobi-app-admin.vercel.app",
    process.env.ADMIN_APP_URL,
    process.env.NEXT_PUBLIC_ADMIN_APP_URL,
  ].filter(Boolean)

  // Check if origin is allowed
  const isAllowedOrigin = origin && allowedOrigins.some(allowed => 
    origin === allowed || origin.startsWith(allowed)
  )

  // Determine allowed origin
  let allowOrigin: string
  if (isAllowedOrigin && origin) {
    // Origin is explicitly in allowed list
    allowOrigin = origin
  } else if (origin) {
    // Check if origin matches Vercel pattern (for preview deployments and production)
    if (origin.includes("vercel.app") && origin.includes("impacthubnairobi")) {
      allowOrigin = origin
    } else if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      // Allow localhost for development
      allowOrigin = origin
    } else {
      // Fallback to first allowed origin
      allowOrigin = allowedOrigins[0] || "*"
    }
  } else {
    // No origin header (same-origin request)
    allowOrigin = allowedOrigins[0] || "*"
  }
  
  // Log CORS decision (helpful for debugging)
  if (process.env.NODE_ENV === "development") {
    console.log("[CORS] Request origin:", origin, "→ Allowed:", allowOrigin)
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  }
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleOptions(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(request),
  })
}
