"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  SessionProvider as NextAuthSessionProvider,
  useSession,
} from "next-auth/react"
import { useEffect } from "react"
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

function EmailVerificationGate() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (
      session?.user?.needsEmailVerification &&
      pathname !== "/verify-email"
    ) {
      const email = session.user.email
      const query = email ? `?email=${encodeURIComponent(email)}` : ""
      router.replace(`/verify-email${query}`)
    }
  }, [pathname, router, session?.user?.email, session?.user?.needsEmailVerification])

  return null
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
      <EmailVerificationGate />
      {children}
    </NextAuthSessionProvider>
  )
}
