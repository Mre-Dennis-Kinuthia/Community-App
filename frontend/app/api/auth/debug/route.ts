import { NextResponse } from "next/server"

/**
 * Debug endpoint to check Auth.js configuration in the same context as the auth handlers
 * This helps diagnose why Auth.js might be throwing Configuration errors
 */
export async function GET() {
  const authSecret = process.env.AUTH_SECRET
  const databaseUrl = process.env.DATABASE_URL
  
  const debug = {
    AUTH_SECRET: {
      exists: !!authSecret,
      length: authSecret?.length || 0,
      isValid: authSecret ? authSecret.length >= 32 : false,
      firstChars: authSecret ? authSecret.substring(0, 4) + "..." : null,
      lastChars: authSecret ? "..." + authSecret.substring(authSecret.length - 4) : null,
    },
    DATABASE_URL: {
      exists: !!databaseUrl,
      startsWith: databaseUrl ? databaseUrl.substring(0, 20) + "..." : null,
    },
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL === "1",
    VERCEL_ENV: process.env.VERCEL_ENV,
  }
  
  // Check if AUTH_SECRET would cause Configuration error
  const wouldFail = !authSecret || authSecret.length < 32
  
  return NextResponse.json(
    {
      status: wouldFail ? "would_fail" : "ok",
      debug,
      message: wouldFail
        ? "AUTH_SECRET is missing or too short - this will cause Configuration error"
        : "AUTH_SECRET looks valid",
      recommendation: wouldFail
        ? "Generate a new AUTH_SECRET with: openssl rand -base64 32 (must be at least 32 characters)"
        : "If you're still seeing Configuration errors, check Vercel function logs",
    },
    { status: wouldFail ? 500 : 200 }
  )
}
