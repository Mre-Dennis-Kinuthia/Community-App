"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { isNavItemActive, MOBILE_MORE_NAV } from "@/lib/nav-config"

type MobileMoreSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileMoreSheet({ open, onOpenChange }: MobileMoreSheetProps) {
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] rounded-t-xl p-0 md:hidden">
        <SheetHeader className="border-b border-border px-3 py-3 text-left">
          <SheetTitle className="sr-only">More navigation</SheetTitle>
          <Logo href="/dashboard" variant="compact" />
          <p className="text-xs text-muted-foreground">Programs, account, and more</p>
        </SheetHeader>
        <nav className="grid gap-0.5 overflow-y-auto p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {MOBILE_MORE_NAV.map((item) => {
            const Icon = item.icon
            const isActive = isNavItemActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 truncate">{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
