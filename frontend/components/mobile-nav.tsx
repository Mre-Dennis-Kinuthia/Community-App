"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, Users, BookOpen, Menu, CalendarDays, Handshake, Lightbulb, Newspaper, BarChart3 } from "lucide-react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { isNavHrefEnabled } from "@/lib/feature-flags"

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Events",
    href: "/events",
    icon: CalendarDays,
  },
  {
    title: "Book Space",
    href: "/booking",
    icon: Calendar,
  },
  {
    title: "Community",
    href: "/community",
    icon: Users,
  },
  {
    title: "Projects & Initiatives",
    href: "/projects",
    icon: Lightbulb,
  },
  {
    title: "Investments & Dealflow",
    href: "/investments",
    icon: BarChart3,
  },
  {
    title: "Partners & Network",
    href: "/partners",
    icon: Handshake,
  },
  {
    title: "Resources",
    href: "/resources",
    icon: BookOpen,
  },
  {
    title: "News & Updates",
    href: "/news",
    icon: Newspaper,
  },
].filter((item) => isNavHrefEnabled(item.href))

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden transition-colors duration-200 ease-out hover:bg-muted/60"
        >
          <Menu className="h-5 w-5 transition-transform duration-200 ease-out" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Logo href="/dashboard" variant="compact" className="mt-1" />
        </SheetHeader>
        <nav className="grid items-start gap-2 p-4">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ease-out",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 transition-colors duration-200 ease-out" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

