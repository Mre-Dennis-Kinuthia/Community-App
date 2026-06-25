import {
  LayoutDashboard,
  Calendar,
  Users,
  CalendarDays,
  Newspaper,
  Handshake,
  Lightbulb,
  BarChart3,
  Sparkles,
  BookOpen,
  FolderOpen,
  User,
  UserRound,
  Package,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react"
import { isNavHrefEnabled } from "@/lib/feature-flags"

export type MobileNavItem = {
  title: string
  href: string
  icon: LucideIcon
}

/** Primary destinations — fixed bottom tab bar */
export const MOBILE_PRIMARY_NAV: MobileNavItem[] = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Book", href: "/booking", icon: Calendar },
  { title: "Community", href: "/community", icon: Users },
  { title: "Events", href: "/events", icon: CalendarDays },
]

/** Secondary destinations — "More" sheet */
export const MOBILE_MORE_NAV: MobileNavItem[] = [
  { title: "News & Updates", href: "/news", icon: Newspaper },
  { title: "Partners", href: "/partners", icon: Handshake },
  { title: "Opportunities", href: "/opportunities", icon: Sparkles },
  { title: "Projects", href: "/projects", icon: Lightbulb },
  { title: "Investments", href: "/investments", icon: BarChart3 },
  { title: "My bookings", href: "/dashboard/bookings", icon: BookOpen },
  { title: "My visitors", href: "/dashboard/visitors", icon: UserRound },
  { title: "My packages", href: "/dashboard/deliveries", icon: Package },
  { title: "My projects", href: "/dashboard/projects", icon: FolderOpen },
  { title: "Profile", href: "/profile", icon: User },
].filter((item) => isNavHrefEnabled(item.href))

export const MOBILE_MORE_TRIGGER: MobileNavItem = {
  title: "More",
  href: "#more",
  icon: MoreHorizontal,
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function isMoreNavActive(pathname: string): boolean {
  return MOBILE_MORE_NAV.some((item) => isNavItemActive(pathname, item.href))
}
