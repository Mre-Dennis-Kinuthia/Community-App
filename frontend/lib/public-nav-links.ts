import { isNavHrefEnabled } from "@/lib/feature-flags"

export type LandingFooterLink = {
  href: string
  label: string
  external?: boolean
}

/** Platform links shown on the marketing footer — respects feature flags. */
export function getLandingFooterPlatformLinks(): LandingFooterLink[] {
  const links: LandingFooterLink[] = [
    { href: "/community", label: "Community" },
    { href: "/programs", label: "Programs & Initiatives" },
    { href: "/events/public", label: "Events & Programs" },
    { href: "/booking", label: "Book Workspace" },
    { href: "/pricing", label: "Pricing" },
  ]

  if (isNavHrefEnabled("/opportunities")) {
    links.push({ href: "/opportunities", label: "Opportunities" })
  }

  if (isNavHrefEnabled("/resources")) {
    links.push({ href: "/resources", label: "Resources" })
  }

  links.push({ href: "/partners", label: "Partners" })

  return links
}

export type LandingNavItem = {
  href: string
  label: string
  external?: boolean
}

export type LandingNavGroup = {
  label: string
  items: LandingNavItem[]
}

/** Landing header anchor links (flat — used for mobile menu and SEO) */
export const LANDING_HEADER_LINKS: LandingNavItem[] = [
  { href: "#services", label: "What we offer" },
  { href: "/programs", label: "Programs" },
  { href: "#events", label: "Events" },
  { href: "#community", label: "Community" },
  { href: "#membership", label: "Membership" },
  { href: "#faq", label: "FAQ" },
  { href: "https://nairobi.impacthub.net/", label: "About IHN", external: true },
]

/** Grouped desktop nav — same destinations, fewer top-level items */
export const LANDING_HEADER_GROUPS: LandingNavGroup[] = [
  {
    label: "Explore",
    items: [
      { href: "#services", label: "What we offer" },
      { href: "/programs", label: "Programs" },
      { href: "#events", label: "Events" },
      { href: "#community", label: "Community" },
    ],
  },
  {
    label: "About",
    items: [
      { href: "#membership", label: "Membership" },
      { href: "#faq", label: "FAQ" },
      { href: "https://nairobi.impacthub.net/", label: "About IHN", external: true },
    ],
  },
]
