import { NextResponse } from "next/server"
import { auth } from "@/auth"

/**
 * Test endpoint to verify Auth.js is properly configured
 * This will attempt to call auth() and see if it throws a Configuration error
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  try {
    // Try to call auth() - this will throw if there's a Configuration error
    const session = await auth()
    
    return NextResponse.json({
      status: "success",
      message: "Auth.js is properly configured",
      hasSession: !!session,
      sessionUser: session?.user?.email || null,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isConfigError = errorMessage.includes("Configuration") || errorMessage.includes("secret")
    
    return NextResponse.json(
      {
        status: "error",
        error: errorMessage,
        isConfigError,
        message: isConfigError
          ? "Auth.js Configuration error detected. Check that AUTH_SECRET is set correctly."
          : "Unexpected error in Auth.js",
      },
      { status: 500 }
    )
  }
}
