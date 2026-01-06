"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, Users, Newspaper } from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Book",
    href: "/booking",
    icon: Calendar,
  },
  {
    title: "Community",
    href: "/community",
    icon: Users,
  },
  {
    title: "News",
    href: "/news",
    icon: Newspaper,
  },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  // Only show on dashboard pages, not on login/register/landing
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

