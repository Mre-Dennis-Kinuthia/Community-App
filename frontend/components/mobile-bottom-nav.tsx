"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MobileMoreSheet } from "@/components/mobile-more-sheet"
import {
  isMoreNavActive,
  isNavItemActive,
  MOBILE_MORE_TRIGGER,
  MOBILE_PRIMARY_NAV,
} from "@/lib/mobile-nav-items"

const HIDDEN_PATHS = new Set(["/", "/login", "/register"])

export function MobileBottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  if (HIDDEN_PATHS.has(pathname)) {
    return null
  }

  const moreActive = isMoreNavActive(pathname) || moreOpen

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden pb-[env(safe-area-inset-bottom)]"
        aria-label="Primary"
      >
        <div className="grid h-16 grid-cols-5">
          {MOBILE_PRIMARY_NAV.map((item) => {
            const Icon = item.icon
            const isActive = isNavItemActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[44px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:bg-muted/50",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon
                  className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")}
                  aria-hidden
                />
                <span>{item.title}</span>
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex min-h-[44px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:bg-muted/50",
              moreActive ? "text-primary" : "text-muted-foreground"
            )}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
          >
            <MOBILE_MORE_TRIGGER.icon
              className={cn("h-5 w-5", moreActive ? "text-primary" : "text-muted-foreground")}
              aria-hidden
            />
            <span>{MOBILE_MORE_TRIGGER.title}</span>
          </button>
        </div>
      </nav>

      <MobileMoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  )
}
