import { AAC_IMAGES } from "@/lib/aac-program"
import { HUB_IMAGES } from "@/lib/landing-assets"

export type LandingProgramStatus = "active" | "upcoming" | "ongoing" | "completed"

export interface LandingProgram {
  id: string
  slug: string
  name: string
  shortName?: string
  tagline: string
  description: string
  status: LandingProgramStatus
  statusLabel: string
  themes: string[]
  duration?: string
  image: string
  accent: string
  featured: boolean
  highlights: string[]
  detailHref?: string
  cta?: {
    label: string
    href: string
    external?: boolean
  }
  contactEmail?: string
}

export const LANDING_THEMATIC_AREAS = [
  { label: "Agriculture", accent: "#7ebb55" },
  { label: "Circularity", accent: "#41bed0" },
  { label: "Climate", accent: "#1c395c" },
  { label: "E-mobility", accent: "#f78a3c" },
  { label: "Digitization", accent: "#822929" },
  { label: "Gender equity", accent: "#ffd546" },
] as const

export const LANDING_PROGRAMS: LandingProgram[] = [
  {
    id: "aac",
    slug: "aac",
    name: "Advancing Agricultural Circularity (AAC)",
    shortName: "AAC",
    tagline: "Closing the loop together: shifting Kenya's agri-food system toward circular, regenerative models.",
    description:
      "A multi-stakeholder programme convened by Impact Hub Nairobi with the DOEN Foundation. Year One established a 38-member Working Group, trained 150 farmers across three Kiambu sub-counties, and tested consumer demand through market activation at the HereAfrica festival.",
    status: "active",
    statusLabel: "Active programme",
    themes: ["Agriculture", "Circularity", "Climate"],
    duration: "Multi-year initiative · Year One complete",
    image: AAC_IMAGES.hero,
    accent: "#7ebb55",
    featured: true,
    detailHref: "/programs/aac",
    highlights: [
      "38-member Working Group · 75 organisations mapped across the ecosystem",
      "Pilot A: Live-in Lab and extension pathway reaching 150 farmers in Kiambu",
      "Pilot B: consumer activation and trust-building at HereAfrica festival",
      "99.3% farmer training attendance · 91.0% with specific action plans",
    ],
    cta: {
      label: "Explore AAC Year One",
      href: "/programs/aac",
    },
    contactEmail: "ihn.programs@impacthub.net",
  },
  {
    id: "climate-cohort",
    slug: "climate-cohort",
    name: "Climate Cohort",
    tagline: "Flagship climate accelerator for ventures building in AgTech, clean energy, and circular economy.",
    description:
      "Climate Cohort is Impact Hub Nairobi's intensive acceleration track for climate-focused startups across East Africa. Selected teams receive structured workshops, 1-on-1 coaching, investor introductions, and stipend support to validate and scale solutions in climate, energy, and circular economy.",
    status: "upcoming",
    statusLabel: "Applications open",
    themes: ["Climate", "AgTech", "Energy"],
    duration: "12 weeks",
    image: AAC_IMAGES.fieldTraining,
    accent: "#41bed0",
    featured: true,
    highlights: [
      "Weekly workshops and expert-led clinics across climate and circular economy themes",
      "1-on-1 mentorship and business development support",
      "Access to a network of impact investors and ecosystem partners",
      "Stipend and showcase opportunities for selected ventures",
    ],
    cta: {
      label: "Browse opportunities",
      href: "/resources?tab=programs",
    },
  },
  {
    id: "star-connect-acceleration",
    slug: "star-connect-acceleration",
    name: "Star Connect Thematic Acceleration",
    tagline: "Dedicated venture support for founders ready to scale with structured acceleration tracks.",
    description:
      "Star Connect members access thematic acceleration programmes spanning agriculture, circularity, climate, e-mobility, digitization, and gender equity. Each track combines diagnostics, coaching, market access, and connections to grants and investors, matched to where your venture is today.",
    status: "ongoing",
    statusLabel: "Member programme",
    themes: ["Acceleration", "Mentorship", "Funding"],
    image: HUB_IMAGES.exteriorPath,
    accent: "#822929",
    featured: false,
    highlights: [
      "360° business diagnostic and tailored growth roadmap",
      "Thematic tracks across six impact areas",
      "Global Passport access to 117+ Impact Hubs worldwide",
      "Direct linkages to grants, investors, and strategic partners",
    ],
    cta: {
      label: "Apply for Star Connect",
      href: "/membership/star-connect",
    },
  },
  {
    id: "ecosystem-workshops",
    slug: "ecosystem-workshops",
    name: "Ecosystem Workshops & Forums",
    tagline: "Interactive sessions that connect innovators, partners, and policymakers around shared challenges.",
    description:
      "From AAC working group convenings to pitch training, impact-themed forums, and partner-led clinics, our workshops are where collaboration turns into action. Many sessions are open to the public; members get priority access and deeper follow-up.",
    status: "ongoing",
    statusLabel: "Recurring",
    themes: ["Events", "Partnerships", "Learning"],
    image: HUB_IMAGES.privateOfficeWindow,
    accent: "#f78a3c",
    featured: false,
    highlights: [
      "World Café and participatory formats for ecosystem problem-solving",
      "Pitch training, office hours, and founder clinics",
      "Partner-led sessions with investors, corporates, and funders",
      "Public and member-only programming throughout the year",
    ],
    cta: {
      label: "View upcoming events",
      href: "/events/public",
    },
  },
]

export function getFeaturedLandingPrograms(limit = 3): LandingProgram[] {
  return LANDING_PROGRAMS.filter((p) => p.featured).slice(0, limit)
}

export function getLandingProgramBySlug(slug: string): LandingProgram | undefined {
  return LANDING_PROGRAMS.find((p) => p.slug === slug)
}
