"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, Users, BookOpen, Clock, ShieldCheck } from "lucide-react"

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
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
    title: "Resources",
    href: "/resources",
    icon: BookOpen,
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: Clock,
  },
  {
    title: "Admin",
    href: "/admin",
    icon: ShieldCheck,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-1 py-6 px-2">
      {items.map((item, index) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <Icon className={cn(
              "mr-3 h-4 w-4 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )} />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
