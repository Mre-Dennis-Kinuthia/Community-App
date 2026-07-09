import type { LandingPartner } from "@/components/landing-partner-logo"

/** Funders and ecosystem partners shown on the landing page. */
export const LANDING_STRATEGIC_PARTNERS: LandingPartner[] = [
  {
    name: "Digital Africa",
    logo: "/partners/digital-africa.png",
    href: "https://digitalafrica.co",
  },
  {
    name: "Stichting DOEN",
    logo: "/partners/doen.png",
    href: "https://www.doen.nl",
  },
  {
    name: "ILRI",
    logo: "/partners/ilri.png",
    href: "https://www.ilri.org",
  },
  {
    name: "CGIAR",
    logo: "/partners/cgiar.png",
    href: "https://www.cgiar.org",
  },
]

/** Implementation partnerships — programs, BDS, space, legal, and ecosystem collaborators. */
export const LANDING_IMPLEMENTATION_PARTNERS: LandingPartner[] = [
  {
    name: "Prochange",
    logo: "/partners/prochange.png",
    href: "https://pro-change.co",
  },
  {
    name: "The Human Edge",
    logo: "/partners/human-edge.png",
  },
  {
    name: "Scio Network",
    logo: "/partners/scio-network.png",
  },
  {
    name: "SNDBX Capital",
    logo: "/partners/sndbx-capital.jpg",
    href: "https://sndbx.capital",
  },
  {
    name: "Amani Institute",
    logo: "/partners/amani-institute.png",
    href: "https://www.amaninstitute.org",
  },
  {
    name: "Circular Innovation Hub",
    logo: "/partners/circular-innovation-hub.png",
  },
  {
    name: "Hays Corporate Advisory",
    logo: "/partners/hays.png",
  },
  {
    name: "Shared Studios",
    logo: "/partners/shared-studios.png",
    href: "https://sharedstudios.com",
  },
  {
    name: "UN Live",
    logo: "/partners/un-live.png",
    href: "https://www.un.org/en/unlive",
  },
  {
    name: "Impact Loop",
    logo: "/partners/impact-loop.png",
  },
  {
    name: "ANSA Africa",
    logo: "/partners/ansa-africa.png",
    href: "https://ansa.africa",
  },
  {
    name: "Wasafiri",
    logo: "/partners/wasafiri.png",
    href: "https://wasafiri.org",
  },
  {
    name: "ENVIU",
    logo: "/partners/enviu.png",
    href: "https://enviu.org",
  },
  {
    name: "ESTDEV",
    logo: "/partners/estdev.png",
    href: "https://estdev.ee",
  },
  {
    name: "Green Belt Movement",
    logo: "/partners/green-belt-movement.jpg",
    href: "https://www.greenbeltmovement.org",
  },
  {
    name: "Startup Grind",
    logo: "/partners/startup-grind.png",
    href: "https://www.startupgrind.com",
  },
]

/** All landing partners (strategic + implementation). */
export const LANDING_PARTNERS: LandingPartner[] = [
  ...LANDING_STRATEGIC_PARTNERS,
  ...LANDING_IMPLEMENTATION_PARTNERS,
]
