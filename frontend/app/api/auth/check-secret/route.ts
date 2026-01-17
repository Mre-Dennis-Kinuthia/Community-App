import { NextResponse } from "next/server"

/**
 * Check if AUTH_SECRET is available at runtime when handlers are called
 * This helps diagnose if the secret is available when NextAuth actually needs it
 */
export async function GET() {
  const authSecret = process.env.AUTH_SECRET
  
  // Try to import auth to see if it throws
  let authImportError = null
  let authAvailable = false
  
  try {
    const authModule = await import("@/auth")
    authAvailable = !!authModule.auth
    if (authModule.auth) {
      // Try to call auth() to see if it throws Configuration error
      try {
        await authModule.auth()
      } catch (error) {
        authImportError = error instanceof Error ? error.message : String(error)
      }
    }
  } catch (error) {
    authImportError = error instanceof Error ? error.message : String(error)
  }
  
  return NextResponse.json({
    runtime: {
      AUTH_SECRET: {
        exists: !!authSecret,
        length: authSecret?.length || 0,
        isValid: authSecret ? authSecret.length >= 32 : false,
      },
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
      },
    },
    authModule: {
      available: authAvailable,
      error: authImportError,
    },
    message: authImportError
      ? `Auth module error: ${authImportError}`
      : "Auth module loaded successfully",
  })
}
