import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

// Create auth function for middleware (Edge runtime) - no Prisma
const { auth } = NextAuth(authConfig)

const publicRoutes = ["/", "/login", "/register", "/api", "/setup-check"]
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
  "/onboarding",
]

export default auth((request) => {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthPage = pathname === "/login" || pathname === "/register"
  const isLoggedIn = !!request.auth

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (isAuthPage) {
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

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
