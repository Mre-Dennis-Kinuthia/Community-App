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
  MoreHorizontal,
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

export type MobileNavItem = {
  title: string
  href: string
  icon: LucideIcon
  /** Extra-short label for the bottom tab bar (≤7 chars ideal) */
  tabTitle?: string
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

/** Bottom tab bar — order and short labels */
const MOBILE_PRIMARY_HREFS = ["/dashboard", "/booking", "/community", "/events"] as const

/** "More" sheet — order matches desktop nav groups (disabled routes omitted at source). */
const MOBILE_MORE_HREFS = [
  "/news",
  "/partners",
  "/opportunities",
  "/dashboard/bookings",
  "/profile",
  "/dashboard/visitors",
  "/dashboard/deliveries",
  "/dashboard/maintenance",
] as const

const MOBILE_TITLE_OVERRIDES: Record<string, string> = {
  "/dashboard": "Home",
  "/booking": "Book",
  "/community": "Community",
  "/events": "Events",
  "/projects": "Projects",
  "/dashboard/bookings": "Bookings",
  "/dashboard/projects": "My work",
  "/dashboard/visitors": "Visitors",
  "/dashboard/deliveries": "Packages",
  "/dashboard/maintenance": "Repairs",
  "/news": "News",
  "/partners": "Partners",
  "/opportunities": "Opportunities",
  "/investments": "Dealflow",
  "/profile": "Profile",
}

/** Ultra-short labels for the 5-column bottom tab bar */
const MOBILE_TAB_TITLE_OVERRIDES: Record<string, string> = {
  "/dashboard": "Home",
  "/booking": "Book",
  "/community": "Network",
  "/events": "Events",
}

const NAV_ITEM_BY_HREF = new Map(
  NAV_GROUPS.flatMap((group) => group.items).map((item) => [item.href, item] as const)
)

function toMobileNavItem(href: string): MobileNavItem | null {
  const item = NAV_ITEM_BY_HREF.get(href)
  if (!item || !isNavHrefEnabled(href)) return null
  return {
    href: item.href,
    icon: item.icon,
    title: MOBILE_TITLE_OVERRIDES[href] ?? item.title,
    tabTitle: MOBILE_TAB_TITLE_OVERRIDES[href],
  }
}

export function getMobilePrimaryNav(): MobileNavItem[] {
  return MOBILE_PRIMARY_HREFS.map((href) => toMobileNavItem(href)).filter(
    (item): item is MobileNavItem => item !== null
  )
}

export function getMobileMoreNav(): MobileNavItem[] {
  return MOBILE_MORE_HREFS.map((href) => toMobileNavItem(href)).filter(
    (item): item is MobileNavItem => item !== null
  )
}

export const MOBILE_PRIMARY_NAV = getMobilePrimaryNav()
export const MOBILE_MORE_NAV = getMobileMoreNav()

export const MOBILE_MORE_TRIGGER: MobileNavItem = {
  title: "More",
  href: "#more",
  icon: MoreHorizontal,
}

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

/** Alias used by mobile navigation components */
export function isNavItemActive(pathname: string, href: string): boolean {
  return isNavPathActive(pathname, href, null)
}

export function isMoreNavActive(pathname: string): boolean {
  return MOBILE_MORE_NAV.some((item) => isNavItemActive(pathname, item.href))
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
