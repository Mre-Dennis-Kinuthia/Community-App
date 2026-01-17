import { NextResponse } from "next/server"

/**
 * Health check endpoint to verify Auth.js configuration
 * Useful for debugging deployment issues
 */
export async function GET() {
  const checks = {
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL === "1",
  }

  const allSet = checks.AUTH_SECRET && checks.DATABASE_URL

  return NextResponse.json(
    {
      status: allSet ? "healthy" : "unhealthy",
      checks,
      message: allSet
        ? "All required environment variables are set"
        : "Missing required environment variables. Check AUTH_SECRET and DATABASE_URL.",
    },
    { status: allSet ? 200 : 500 }
  )
}
