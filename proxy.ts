import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "@/lib/auth"

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/api",
]

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/community",
  "/booking",
  "/resources",
  "/profile",
  "/admin",
  "/events",
  "/partners",
  "/projects",
  "/news",
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get session cookie from request
  const sessionCookie = request.cookies.get("session")?.value
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  )
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // If it's a protected route, check authentication
  if (isProtectedRoute) {
    let hasSession = false
    
    if (sessionCookie) {
      try {
        const session = await decrypt(sessionCookie)
        hasSession = !!session
      } catch (error) {
        // Invalid session, treat as not authenticated
        hasSession = false
      }
    }
    
    if (!hasSession) {
      // Redirect to login with return URL
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // If user is logged in and tries to access login/register, redirect to dashboard
  if (pathname === "/login" || pathname === "/register") {
    if (sessionCookie) {
      try {
        const session = await decrypt(sessionCookie)
        if (session) {
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      } catch (error) {
        // Invalid session, continue to login/register
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
