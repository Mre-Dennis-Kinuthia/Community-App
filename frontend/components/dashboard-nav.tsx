"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useSidebar } from "@/components/sidebar-context"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarNavTooltip } from "@/components/sidebar-nav-tooltip"
import {
  getDefaultOpenGroups,
  getVisibleNavGroups,
  isFrontDeskPathActive,
  isNavPathActive,
  type NavItemConfig,
} from "@/lib/nav-config"
import { useNavBadges } from "@/lib/hooks/use-nav-badges"

function NavLinkContent({
  item,
  isActive,
  badge,
  compact,
}: {
  item: NavItemConfig
  isActive: boolean
  badge?: number | string
  compact?: boolean
}) {
  const Icon = item.icon

  if (compact) {
    return (
      <>
        {isActive && (
          <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-primary" />
        )}
        <Icon
          className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")}
        />
        {badge ? (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-medium text-primary-foreground">
            {badge}
          </span>
        ) : null}
      </>
    )
  }

  return (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-colors duration-200 ease-out",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
        />
        <span className="min-w-0 break-words">{item.title}</span>
      </div>
      {badge ? (
        <Badge variant="secondary" className="ml-2 h-5 min-w-5 shrink-0 px-1.5 text-xs">
          {badge}
        </Badge>
      ) : null}
    </>
  )
}

function resolveBadge(
  item: NavItemConfig,
  badges: Partial<Record<string, number>>
): number | undefined {
  if (!item.badgeKey) return undefined
  const value = badges[item.badgeKey]
  return value && value > 0 ? value : undefined
}

export function DashboardNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const resourcesTab = searchParams.get("tab")
  const { isCollapsed } = useSidebar()
  const badges = useNavBadges()

  const visibleNavGroups = useMemo(() => getVisibleNavGroups(), [])

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    getDefaultOpenGroups(pathname, visibleNavGroups, resourcesTab)
  )

  const workspaceGroup = visibleNavGroups.find((g) => g.title === "Workspace")
  const [frontDeskOpen, setFrontDeskOpen] = useState(() =>
    workspaceGroup
      ? isFrontDeskPathActive(pathname, workspaceGroup.items, resourcesTab)
      : false
  )

  useEffect(() => {
    setOpenGroups(getDefaultOpenGroups(pathname, visibleNavGroups, resourcesTab))
    if (workspaceGroup) {
      setFrontDeskOpen(isFrontDeskPathActive(pathname, workspaceGroup.items, resourcesTab))
    }
  }, [pathname, resourcesTab, visibleNavGroups, workspaceGroup])

  const toggleGroup = (groupTitle: string) => {
    if (!isCollapsed) {
      setOpenGroups((prev) => ({
        ...prev,
        [groupTitle]: !prev[groupTitle],
      }))
    }
  }

  const renderNavItem = (item: NavItemConfig, indent = false) => {
    const isActive = isNavPathActive(pathname, item.href, resourcesTab)
    const badge = resolveBadge(item, badges)

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group relative flex min-h-9 items-center justify-between rounded-sm px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
          indent && "pl-4",
          isActive
            ? "bg-sidebar-accent text-foreground before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-full before:bg-primary"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        )}
      >
        <NavLinkContent item={item} isActive={isActive} badge={badge} />
      </Link>
    )
  }

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={200} skipDelayDuration={80}>
        <nav className="flex flex-col items-center gap-1 py-5 px-1.5">
          {visibleNavGroups.map((group, groupIndex) => (
            <div
              key={group.title}
              className={cn(
                "flex w-full flex-col items-center gap-0.5",
                groupIndex === visibleNavGroups.length - 1 ? "pb-0" : "pb-3 mb-1 border-b border-border/40"
              )}
            >
              {group.items.map((item) => {
                const isActive = isNavPathActive(pathname, item.href, resourcesTab)
                const badge = resolveBadge(item, badges)
                return (
                  <SidebarNavTooltip key={item.href} label={item.title} group={group.title}>
                    <Link
                      href={item.href}
                      className={cn(
                        "relative flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                      )}
                    >
                      <NavLinkContent item={item} isActive={isActive} badge={badge} compact />
                    </Link>
                  </SidebarNavTooltip>
                )
              })}
            </div>
          ))}
        </nav>
      </TooltipProvider>
    )
  }

  return (
    <nav className="grid items-start gap-1 py-5 px-3">
      {visibleNavGroups.map((group, groupIndex) => {
        const isOpen = openGroups[group.title]
        const hasActiveItem = group.items.some((item) =>
          isNavPathActive(pathname, item.href, resourcesTab)
        )
        const primaryItems = group.items.filter((item) => !item.frontDesk)
        const frontDeskItems = group.items.filter((item) => item.frontDesk)
        const hasFrontDesk = frontDeskItems.length > 0

        return (
          <div
            key={group.title}
            className={cn(
              "space-y-0.5",
              groupIndex === visibleNavGroups.length - 1 ? "pb-0" : "pb-4 mb-2 border-b border-border/40"
            )}
          >
            <button
              type="button"
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
                  {primaryItems.map((item) => renderNavItem(item))}

                  {hasFrontDesk ? (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setFrontDeskOpen((prev) => !prev)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-sm px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          frontDeskItems.some((item) =>
                            isNavPathActive(pathname, item.href, resourcesTab)
                          ) && "text-foreground"
                        )}
                      >
                        <span>Front desk</span>
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 shrink-0 transition-transform duration-200",
                            frontDeskOpen ? "rotate-0" : "-rotate-90"
                          )}
                        />
                      </button>
                      <div
                        className={cn(
                          "grid transition-[grid-template-rows] duration-200 ease-out",
                          frontDeskOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        )}
                      >
                        <div className="overflow-hidden">
                          <div className="mt-0.5 space-y-0.5">
                            {frontDeskItems.map((item) => renderNavItem(item, true))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </nav>
  )
}
