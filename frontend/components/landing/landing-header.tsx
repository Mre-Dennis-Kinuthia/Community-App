"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Menu, X } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LANDING_HEADER_GROUPS,
  LANDING_HEADER_LINKS,
  type LandingNavItem,
} from "@/lib/public-nav-links"
import { cn } from "@/lib/utils"

const navLinkClass =
  "text-[13px] font-medium text-[#1c395c]/75 transition-colors hover:text-[#0a1f38]"

function NavAnchor({
  item,
  className,
  onClick,
}: {
  item: LandingNavItem
  className?: string
  onClick?: () => void
}) {
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {item.label}
      </a>
    )
  }

  if (item.href.startsWith("/")) {
    return (
      <Link href={item.href} className={className} onClick={onClick}>
        {item.label}
      </Link>
    )
  }

  return (
    <a href={item.href} className={className} onClick={onClick}>
      {item.label}
    </a>
  )
}

function DesktopNavGroup({
  label,
  items,
}: {
  label: string
  items: LandingNavItem[]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          navLinkClass,
          "inline-flex items-center gap-0.5 rounded-md px-1 py-1 outline-none",
          "hover:bg-[#1c395c]/5 focus-visible:ring-2 focus-visible:ring-[#812926]/30"
        )}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[11rem]">
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <NavAnchor
              item={item}
              className="w-full cursor-pointer text-sm text-[#1c395c]"
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Wide screens: all links visible in one row with tighter spacing */
function WideDesktopNav() {
  return (
    <nav
      className="hidden items-center gap-x-4 xl:flex 2xl:gap-x-5"
      aria-label="Primary"
    >
      {LANDING_HEADER_LINKS.map((item) => (
        <NavAnchor key={item.href} item={item} className={navLinkClass} />
      ))}
    </nav>
  )
}

/** Medium/large screens: grouped dropdowns */
function CompactDesktopNav() {
  return (
    <nav
      className="hidden items-center gap-x-5 md:flex xl:hidden"
      aria-label="Primary"
    >
      {LANDING_HEADER_GROUPS.map((group) => (
        <DesktopNavGroup key={group.label} label={group.label} items={group.items} />
      ))}
    </nav>
  )
}

export function LandingHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <header className="landing-header sticky top-0 z-50 overflow-x-hidden">
      <div className="container flex h-14 min-w-0 items-center justify-between gap-3 px-4 md:gap-4 md:px-6">
        <Logo href="/" variant="landing" className="shrink-0" />

        <WideDesktopNav />
        <CompactDesktopNav />

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-[13px] text-[#1c395c]/80 hover:text-[#0a1f38] md:h-9 md:px-3"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="sm"
              className="h-8 bg-[#812926] px-2.5 text-[13px] hover:bg-[#6b2120] md:h-9 md:px-3 xl:px-4"
            >
              <span className="xl:hidden">Join</span>
              <span className="hidden xl:inline">Become a member</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-expanded={mobileNavOpen}
            aria-controls="landing-mobile-nav"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileNavOpen ? (
        <div id="landing-mobile-nav" className="border-t border-border bg-background md:hidden">
          <nav className="container max-h-[min(70vh,24rem)] overflow-y-auto px-4 py-3" aria-label="Mobile">
            {LANDING_HEADER_GROUPS.map((group) => (
              <div key={group.label} className="mb-3 last:mb-0">
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <NavAnchor
                    key={item.href}
                    item={item}
                    className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    onClick={() => setMobileNavOpen(false)}
                  />
                ))}
              </div>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <Link href="/login" onClick={() => setMobileNavOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Sign in
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileNavOpen(false)}>
                <Button className="w-full bg-[#812926] hover:bg-[#6b2120]">Become a member</Button>
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
