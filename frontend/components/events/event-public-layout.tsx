"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/use-session"

interface EventPublicLayoutProps {
  children: React.ReactNode
}

export function EventPublicLayout({ children }: EventPublicLayoutProps) {
  const { user, status } = useSession()
  const isLoggedIn = status !== "loading" && !!user

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo href="/" variant="compact" />
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/events">All events</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center text-xs text-muted-foreground">
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
