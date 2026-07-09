import { LANDING_IMAGES } from "@/lib/landing-assets"

export const COMMUNITY_VOICES = [
  {
    quote:
      "The mixers and office hours are where real collaborations start — I've met co-founders, mentors, and investors all in one place.",
    attribution: "Community member",
    context: "Early-stage founder · Climate & circularity",
    accent: "#7ebb55",
  },
  {
    quote:
      "It's more than a desk. You're surrounded by people building for impact — the energy in our workspace pushes you to think bigger.",
    attribution: "Star Connect member",
    context: "Growth-stage venture · Agri-tech",
    accent: "#41bed0",
  },
  {
    quote:
      "We partner with Impact Hub because the community is curated — founders, institutions, and funders actually show up and build together.",
    attribution: "Ecosystem partner",
    context: "Program collaborator · Nairobi",
    accent: "#f78a3c",
  },
] as const

export const MEMBER_ARCHETYPES = [
  { label: "Impact founders", emoji: "🚀" },
  { label: "Investors & funders", emoji: "💡" },
  { label: "Program partners", emoji: "🤝" },
  { label: "Creatives & builders", emoji: "✨" },
  { label: "Policy & research", emoji: "📊" },
  { label: "Students & fellows", emoji: "🎓" },
] as const

export const COMMUNITY_MOMENTS = [
  {
    image: LANDING_IMAGES.pillars.innovation,
    caption: "Global network gatherings",
  },
  {
    image: LANDING_IMAGES.pillars.coworking,
    caption: "Co-working & collaboration",
  },
  {
    image: LANDING_IMAGES.pillars.programs,
    caption: "Programs & workshops",
  },
  {
    image: LANDING_IMAGES.hero,
    caption: "Community in Nairobi",
  },
] as const

export const HERO_AVATAR_INITIALS = ["A", "K", "M", "S", "J"] as const

export const HERO_AVATAR_COLORS = [
  "#7ebb55",
  "#41bed0",
  "#812926",
  "#f78a3c",
  "#1c395c",
] as const

export interface LandingCommunityPreview {
  memberCount: number
  upcomingEventsCount: number
  featuredMembers: Array<{
    name: string
    image: string | null
    role: string | null
    industry: string | null
    organization: string | null
  }>
}
