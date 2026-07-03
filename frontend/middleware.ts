import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { isDeactivatedRoute } from "@/lib/feature-flags"
import {
  APP_HOME_PATH,
  isAuthPagePath,
  MARKETING_HOME_PATH,
  resolveAuthenticatedRedirect,
} from "@/lib/auth-routes"

// Create auth function for middleware (Edge runtime) - no Prisma
const { auth } = NextAuth(authConfig)

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/accept-invite",
  "/privacy",
  "/terms",
  "/pay",
  "/membership",
  "/admin-access",
  "/api",
  "/setup-check",
]
const protectedRoutes = [
  "/dashboard",
  "/community",
  "/booking",
  "/billing",
  "/resources",
  "/opportunities",
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
  const isAuthPage = isAuthPagePath(pathname)
  const isLoggedIn = !!request.auth

  // Signed-in users should use the app, not marketing or sign-in screens
  if (
    isLoggedIn &&
    (isAuthPage || pathname === MARKETING_HOME_PATH)
  ) {
    const destination = resolveAuthenticatedRedirect(
      request.nextUrl.searchParams.get("redirect"),
      request.nextUrl.searchParams.get("callbackUrl")
    )
    return NextResponse.redirect(new URL(destination, request.url))
  }

  if (isAuthPage) {
    return NextResponse.next()
  }

  // Public event pages (short /e/{code} and /events/{slug|id})
  const isPublicEventDetail =
    /^\/events\/[^/]+$/.test(pathname) && pathname !== "/events"
  const isShortEventLink = /^\/e\/[^/]+$/.test(pathname)
  if (isPublicEventDetail || isShortEventLink) {
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
