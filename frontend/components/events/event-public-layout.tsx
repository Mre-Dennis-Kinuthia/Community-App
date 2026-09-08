"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/use-session"

interface EventPublicLayoutProps {
  children: React.ReactNode
}

export function EventPublicLayout({ children }: EventPublicLayoutProps) {
  const { user, status } = useSession()
  const pathname = usePathname()
  const isLoggedIn = status !== "loading" && !!user
  const authRedirect = encodeURIComponent(pathname || "/events")

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#eef3dc_0%,#f7f4ea_42%,#eaf1d8_100%)]">
      <header className="sticky top-0 z-50 border-b border-[#edeff2]/80 bg-[#f7f4ea]/90 backdrop-blur supports-[backdrop-filter]:bg-[#f7f4ea]/75">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:h-14 sm:px-6">
          <Logo href="/" variant="compact" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden h-8 px-2 text-[#1c395c] sm:inline-flex">
                  <Link href="/events">All events</Link>
                </Button>
                <Button size="sm" asChild className="h-8 bg-[#812926] px-3 text-xs hover:bg-[#6b2120] sm:h-9 sm:px-4 sm:text-sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-[#1c395c] sm:h-9">
                  <Link href={`/login?redirect=${authRedirect}`}>Log in</Link>
                </Button>
                <Button size="sm" asChild className="h-8 bg-[#812926] px-3 text-xs hover:bg-[#6b2120] sm:h-9 sm:px-4 sm:text-sm">
                  <Link href={`/register?redirect=${authRedirect}`}>Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="py-4 sm:border-t sm:border-[#edeff2] sm:bg-[#f3f5f8]/70 sm:py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-[11px] text-[#1c395c]/65 sm:px-6 sm:text-xs">
          <p>
            Hosted by{" "}
            <Link href="/" className="underline underline-offset-2 hover:text-foreground">
              Impact Hub Nairobi
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
