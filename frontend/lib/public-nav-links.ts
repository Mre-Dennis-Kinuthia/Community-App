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
    { href: "/events/public", label: "Events & Programs" },
    { href: "/booking", label: "Book Workspace" },
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

/** Landing header anchor links */
export const LANDING_HEADER_LINKS = [
  { href: "#services", label: "What we offer" },
  { href: "#events", label: "Events" },
  { href: "#community", label: "Community" },
  { href: "#membership", label: "Become a member" },
  { href: "#faq", label: "FAQ" },
  { href: "https://nairobi.impacthub.net/", label: "About IHN", external: true },
] as const
