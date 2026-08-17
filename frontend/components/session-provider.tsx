"use client"

import { usePathname } from "next/navigation"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

function isPublicMarketingPath(pathname: string | null): boolean {
  if (!pathname) return false
  return (
    pathname === "/" ||
    pathname.startsWith("/membership") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/programs")
  )
}

export function SessionProvider({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const skipRefetch = isPublicMarketingPath(pathname)

  return (
    <NextAuthSessionProvider
      basePath="/api/auth"
      refetchOnWindowFocus={!skipRefetch}
      refetchInterval={0}
    >
      {children}
    </NextAuthSessionProvider>
  )
}
