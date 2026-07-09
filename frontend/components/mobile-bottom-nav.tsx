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
} from "@/lib/nav-config"

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
        <div className="grid h-14 grid-cols-5">
          {MOBILE_PRIMARY_NAV.map((item) => {
            const Icon = item.icon
            const isActive = isNavItemActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors active:bg-muted/50",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon
                  className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "text-muted-foreground")}
                  aria-hidden
                />
                <span className="w-full max-w-[4.5rem] truncate text-center text-[10px] font-medium leading-none whitespace-nowrap">
                  {item.tabTitle ?? item.title}
                </span>
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors active:bg-muted/50",
              moreActive ? "text-primary" : "text-muted-foreground"
            )}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
          >
            <MOBILE_MORE_TRIGGER.icon
              className={cn("h-[18px] w-[18px]", moreActive ? "text-primary" : "text-muted-foreground")}
              aria-hidden
            />
            <span className="w-full max-w-[4.5rem] truncate text-center text-[10px] font-medium leading-none whitespace-nowrap">
              {MOBILE_MORE_TRIGGER.title}
            </span>
          </button>
        </div>
      </nav>

      <MobileMoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  )
}
