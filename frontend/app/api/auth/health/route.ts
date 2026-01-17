import { NextResponse } from "next/server"

/**
 * Health check endpoint to verify Auth.js configuration
 * Useful for debugging deployment issues
 */
export async function GET() {
  const authSecret = process.env.AUTH_SECRET
  const databaseUrl = process.env.DATABASE_URL
  
  const checks = {
    AUTH_SECRET: !!authSecret,
    AUTH_SECRET_LENGTH: authSecret?.length || 0,
    AUTH_SECRET_VALID: authSecret ? authSecret.length >= 32 : false,
    DATABASE_URL: !!databaseUrl,
    DATABASE_URL_STARTS_WITH: databaseUrl ? databaseUrl.substring(0, 20) + "..." : null,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL === "1",
    VERCEL_ENV: process.env.VERCEL_ENV || "unknown",
  }

  const allSet = checks.AUTH_SECRET && checks.DATABASE_URL && checks.AUTH_SECRET_VALID

  // Provide detailed feedback
  const issues: string[] = []
  if (!checks.AUTH_SECRET) {
    issues.push("AUTH_SECRET is not set")
  } else if (!checks.AUTH_SECRET_VALID) {
    issues.push(`AUTH_SECRET is too short (${checks.AUTH_SECRET_LENGTH} chars, need at least 32)`)
  }
  if (!checks.DATABASE_URL) {
    issues.push("DATABASE_URL is not set")
  }

  return NextResponse.json(
    {
      status: allSet ? "healthy" : "unhealthy",
      checks,
      issues,
      message: allSet
        ? "All required environment variables are set and valid"
        : `Issues found: ${issues.join(", ")}`,
      troubleshooting: !allSet ? {
        step1: "Go to Vercel Dashboard → Your Project → Settings → Environment Variables",
        step2: "Verify AUTH_SECRET and DATABASE_URL are set",
        step3: "Make sure they are enabled for ALL environments (Production, Preview, Development)",
        step4: "Redeploy your application (Deployments → ⋯ → Redeploy)",
        step5: "Wait for deployment to complete, then check this endpoint again",
      } : undefined,
    },
    { status: allSet ? 200 : 500 }
  )
}
