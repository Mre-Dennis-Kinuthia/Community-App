import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSession } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const session = await getSession()

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard")
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")
  const isProfileRoute = request.nextUrl.pathname.startsWith("/profile")

  if ((isDashboardRoute || isAdminRoute || isProfileRoute) && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*"],
}
