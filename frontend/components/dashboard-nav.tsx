"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, BookOpen, Calendar, CalendarDays, Handshake, Lightbulb, Newspaper, ChevronDown, ChevronRight, Building2, FolderOpen } from "lucide-react"
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
        title: "My projects",
        href: "/dashboard/projects",
        icon: FolderOpen,
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
        title: "Events",
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
        <nav className="grid items-start gap-2 py-5 px-2">
          {navGroups.map((group, groupIndex) => {
            return (
              <div
                key={group.title}
                className={cn(
                  "space-y-0.5",
                  groupIndex === navGroups.length - 1 ? "pb-0" : "pb-4 mb-1 border-b border-border/40"
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
                            "relative flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
                            isActive
                              ? "bg-primary/15 text-primary shadow-sm"
                              : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                          )}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary transition-opacity duration-200 ease-out" />
                          )}
                          <Icon
                            className={cn(
                              "h-5 w-5 shrink-0 transition-colors duration-200 ease-out",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                          {item.badge && (
                            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="ml-2 font-medium">
                        {item.title}
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
    <nav className="grid items-start gap-1 py-5 px-3">
      {navGroups.map((group, groupIndex) => {
        const isOpen = openGroups[group.title]
        const hasActiveItem = group.items.some((item) => isItemActive(item.href))

        return (
          <div
            key={group.title}
            className={cn(
              "space-y-0.5",
              groupIndex === navGroups.length - 1 ? "pb-0" : "pb-4 mb-2 border-b border-border/40"
            )}
          >
            <button
              onClick={() => toggleGroup(group.title)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider transition-colors duration-200 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                hasActiveItem ? "text-foreground/90" : "text-muted-foreground/80"
              )}
            >
              <span>{group.title}</span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-300 ease-out",
                  isOpen ? "rotate-0" : "-rotate-90"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <div className="mt-1 space-y-0.5 border-l border-border/50 pl-2 ml-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = isItemActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group relative flex min-h-10 items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
                          isActive
                            ? "border-l-2 border-primary -ml-[3px] bg-primary/10 pl-[13px] text-primary"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                        )}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors duration-200 ease-out",
                              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}
                          />
                          <span className="min-w-0 break-words">{item.title}</span>
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 h-5 min-w-5 shrink-0 px-1.5 text-xs transition-opacity duration-200">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </nav>
  )
}
