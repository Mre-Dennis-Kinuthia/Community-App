import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  CalendarDays,
  Handshake,
  Lightbulb,
  Newspaper,
  FolderOpen,
  BarChart3,
  Sparkles,
  UserRound,
  Package,
  Wrench,
  User,
  type LucideIcon,
} from "lucide-react"
import { isNavHrefEnabled } from "@/lib/feature-flags"

export type NavBadgeKey = "upcomingEvents"

export type NavItemConfig = {
  title: string
  href: string
  icon: LucideIcon
  /** Workspace items shown under a collapsible "Front desk" sub-section */
  frontDesk?: boolean
  badgeKey?: NavBadgeKey
}

export type NavGroupConfig = {
  title: string
  items: NavItemConfig[]
}

export const NAV_GROUPS: NavGroupConfig[] = [
  {
    title: "Main",
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Workspace",
    items: [
      { title: "Book Workspace", href: "/booking", icon: Calendar },
      { title: "My Bookings", href: "/dashboard/bookings", icon: BookOpen },
      { title: "My Visitors", href: "/dashboard/visitors", icon: UserRound, frontDesk: true },
      { title: "My Packages", href: "/dashboard/deliveries", icon: Package, frontDesk: true },
      { title: "Maintenance", href: "/dashboard/maintenance", icon: Wrench, frontDesk: true },
    ],
  },
  {
    title: "Community",
    items: [
      { title: "Community Directory", href: "/community", icon: Users },
      { title: "Projects & Initiatives", href: "/projects", icon: Lightbulb },
      { title: "Investments & Dealflow", href: "/investments", icon: BarChart3 },
      { title: "My projects", href: "/dashboard/projects", icon: FolderOpen },
      { title: "News & Updates", href: "/news", icon: Newspaper },
      { title: "Partners & Network", href: "/partners", icon: Handshake },
    ],
  },
  {
    title: "Programs",
    items: [
      { title: "Events", href: "/events", icon: CalendarDays, badgeKey: "upcomingEvents" },
      { title: "Opportunities", href: "/opportunities", icon: Sparkles },
    ],
  },
  {
    title: "Account",
    items: [{ title: "Profile", href: "/profile", icon: User }],
  },
]

export function getVisibleNavGroups(): NavGroupConfig[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => isNavHrefEnabled(item.href)),
  })).filter((group) => group.items.length > 0)
}

/** Whether a nav href matches the current route (incl. opportunities → resources tab). */
export function isNavPathActive(
  pathname: string,
  href: string,
  resourcesTab?: string | null
): boolean {
  if (href === "/dashboard") return pathname === "/dashboard"
  if (href === "/opportunities") {
    return (
      pathname === "/opportunities" ||
      pathname.startsWith("/resources/opportunities") ||
      (pathname === "/resources" && resourcesTab === "programs")
    )
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Expand only Main and the group containing the active route by default. */
export function getDefaultOpenGroups(
  pathname: string,
  groups: NavGroupConfig[],
  resourcesTab?: string | null
): Record<string, boolean> {
  const open: Record<string, boolean> = {}
  for (const group of groups) {
    if (group.title === "Main") {
      open[group.title] = true
      continue
    }
    open[group.title] = group.items.some((item) =>
      isNavPathActive(pathname, item.href, resourcesTab)
    )
  }
  return open
}

export function isFrontDeskPathActive(
  pathname: string,
  items: NavItemConfig[],
  resourcesTab?: string | null
): boolean {
  return items
    .filter((item) => item.frontDesk)
    .some((item) => isNavPathActive(pathname, item.href, resourcesTab))
}
