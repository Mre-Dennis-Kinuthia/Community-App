import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { isDeactivatedRoute } from "@/lib/feature-flags"

// Create auth function for middleware (Edge runtime) - no Prisma
const { auth } = NextAuth(authConfig)

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
  "/api",
  "/setup-check",
]
const protectedRoutes = [
  "/dashboard",
  "/community",
  "/booking",
  "/billing",
  "/resources",
  "/profile",
  "/events",
  "/partners",
  "/projects",
  "/news",
  "/investments",
  "/onboarding",
]

export default auth((request) => {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  const isLoggedIn = !!request.auth

  // Send authenticated users through onboarding first (page redirects to dashboard when complete)
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  if (isAuthPage) {
    return NextResponse.next()
  }

  // Public event detail pages are shareable without login (Luma-style links)
  const isPublicEventDetail =
    /^\/events\/[^/]+$/.test(pathname) && pathname !== "/events"
  if (isPublicEventDetail) {
    return NextResponse.next()
  }

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
  if (isPublicRoute) {
    return NextResponse.next()
  }

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isDeactivatedRoute(pathname)) {
    const url = new URL("/dashboard", request.url)
    url.searchParams.set("notice", "feature-unavailable")
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
