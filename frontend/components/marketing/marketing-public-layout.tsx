"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/use-session"

interface MarketingPublicLayoutProps {
  children: React.ReactNode
}

export function MarketingPublicLayout({ children }: MarketingPublicLayoutProps) {
  const { user, status } = useSession()
  const isLoggedIn = status !== "loading" && !!user

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6]">
      <header className="sticky top-0 z-50 border-b border-[#edeff2] bg-[#faf9f6]/95 backdrop-blur supports-[backdrop-filter]:bg-[#faf9f6]/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo href="/" variant="compact" />
          <nav className="hidden items-center gap-1 sm:flex">
            <Button variant="ghost" size="sm" asChild className="text-[#1c395c]">
              <Link href="/programs">Programs</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-[#1c395c]">
              <Link href="/events/public">Events</Link>
            </Button>
          </nav>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" asChild className="text-[#1c395c]">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button size="sm" asChild className="bg-[#812926] hover:bg-[#6b2120]">
                  <Link href="/community">Community</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-[#1c395c]">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild className="bg-[#812926] hover:bg-[#6b2120]">
                  <Link href="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#edeff2] bg-[#f3f5f8] py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-[#1c395c]/70 sm:px-6">
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
