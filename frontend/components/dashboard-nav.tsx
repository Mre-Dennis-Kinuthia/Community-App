"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, BookOpen, Calendar, CalendarDays, Handshake, Lightbulb, Newspaper, ChevronDown, Building2, FolderOpen, BarChart3, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useSidebar } from "@/components/sidebar-context"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarNavTooltip } from "@/components/sidebar-nav-tooltip"
import { isNavHrefEnabled } from "@/lib/feature-flags"

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
        title: "Investments & Dealflow",
        href: "/investments",
        icon: BarChart3,
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
        title: "Opportunities",
        href: "/opportunities",
        icon: Sparkles,
      },
      {
        title: "Resource library",
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

const visibleNavGroups = navGroups
  .map((group) => ({
    ...group,
    items: group.items.filter((item) => isNavHrefEnabled(item.href)),
  }))
  .filter((group) => group.items.length > 0)

export function DashboardNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const resourcesTab = searchParams.get("tab")
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

  const isItemActive = (href: string) => {
    if (href === "/opportunities") {
      return (
        pathname === "/opportunities" ||
        pathname.startsWith("/resources/opportunities") ||
        (pathname === "/resources" && resourcesTab === "programs")
      )
    }
    if (href === "/resources") {
      return pathname === "/resources" && resourcesTab !== "programs"
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  // Collapsed view - show only icons
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={200} skipDelayDuration={80}>
        <nav className="flex flex-col items-center gap-1 py-5 px-1.5">
          {visibleNavGroups.map((group, groupIndex) => {
            return (
              <div
                key={group.title}
                className={cn(
                  "flex w-full flex-col items-center gap-0.5",
                  groupIndex === visibleNavGroups.length - 1 ? "pb-0" : "pb-3 mb-1 border-b border-border/40"
                )}
              >
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = isItemActive(item.href)
                  return (
                    <SidebarNavTooltip
                      key={item.href}
                      label={item.title}
                      group={group.title}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "relative flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-primary" />
                        )}
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        {item.badge ? (
                          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-medium text-primary-foreground">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </SidebarNavTooltip>
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
      {visibleNavGroups.map((group, groupIndex) => {
        const isOpen = openGroups[group.title]
        const hasActiveItem = group.items.some((item) => isItemActive(item.href))

        return (
          <div
            key={group.title}
            className={cn(
              "space-y-0.5",
              groupIndex === visibleNavGroups.length - 1 ? "pb-0" : "pb-4 mb-2 border-b border-border/40"
            )}
          >
            <button
              onClick={() => toggleGroup(group.title)}
              className={cn(
                "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                hasActiveItem && "text-foreground"
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
                <div className="mt-1 space-y-0.5 border-l border-border pl-2 ml-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = isItemActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group relative flex min-h-9 items-center justify-between rounded-sm px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
                          isActive
                            ? "bg-sidebar-accent text-foreground before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-full before:bg-primary"
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
