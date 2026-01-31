"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, BookOpen, Calendar, CalendarDays, Handshake, Lightbulb, Newspaper, ChevronDown, ChevronRight, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useSidebar } from "@/components/sidebar-context"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface NavItem {
  title: string
  href: string
  icon: any
  badge?: number | string
}

interface NavGroup {
  title: string
  items: NavItem[]
  icon?: any
}

const navGroups: NavGroup[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Workspace",
    items: [
      {
        title: "Book Workspace",
        href: "/booking",
        icon: Calendar,
      },
      {
        title: "My Bookings",
        href: "/dashboard/bookings",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        title: "Community Directory",
        href: "/community",
        icon: Users,
      },
      {
        title: "Projects & Initiatives",
        href: "/projects",
        icon: Lightbulb,
      },
      {
        title: "News & Updates",
        href: "/news",
        icon: Newspaper,
      },
    ],
  },
  {
    title: "Programs",
    items: [
      {
        title: "Events & Programs",
        href: "/events",
        icon: CalendarDays,
      },
      {
        title: "Programs & Resources",
        href: "/resources",
        icon: BookOpen,
      },
      {
        title: "Partners & Network",
        href: "/partners",
        icon: Handshake,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        href: "/profile",
        icon: Users,
      },
    ],
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { isCollapsed } = useSidebar()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Main: true,
    Workspace: true,
    Community: true,
    Programs: true,
    Account: true,
  })

  const toggleGroup = (groupTitle: string) => {
    if (!isCollapsed) {
      setOpenGroups((prev) => ({
        ...prev,
        [groupTitle]: !prev[groupTitle],
      }))
    }
  }

  const isItemActive = (href: string) => pathname === href

  // Collapsed view - show only icons
  if (isCollapsed) {
    return (
      <TooltipProvider>
        <nav className="grid items-start gap-3 py-6 px-2">
          {navGroups.map((group, groupIndex) => {
            const hasActiveItem = group.items.some((item) => isItemActive(item.href))
            return (
              <div
                key={group.title}
                className={cn(
                  "space-y-1 pb-3",
                  groupIndex === navGroups.length - 1 ? "border-0 pb-0" : "border-b border-border/60"
                )}
              >
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = isItemActive(item.href)
                  return (
                    <Tooltip key={item.href} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "relative flex h-11 items-center justify-center rounded-lg p-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                          )}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                          )}
                          <Icon
                            className={cn(
                              "h-5 w-5 transition-colors",
                              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}
                          />
                          {item.badge && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="ml-2">
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            )
          })}
        </nav>
      </TooltipProvider>
    )
  }

  // Expanded view - show full navigation
  return (
    <nav className="grid items-start gap-3 py-6 px-2">
      {navGroups.map((group, groupIndex) => {
        const isOpen = openGroups[group.title]
        const hasActiveItem = group.items.some((item) => isItemActive(item.href))

        return (
          <div
            key={group.title}
            className={cn(
              "space-y-1 pb-3",
              groupIndex === navGroups.length - 1 ? "border-0 pb-0" : "border-b border-border/60"
            )}
          >
            <button
              onClick={() => toggleGroup(group.title)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                hasActiveItem && "text-foreground"
              )}
            >
              <span>{group.title}</span>
              {isOpen ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            {isOpen && (
              <div className="space-y-1 pl-2">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = isItemActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex h-11 items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                      )}
                      <div className="flex items-center">
                        <Icon
                          className={cn(
                            "mr-3 h-5 w-5 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
