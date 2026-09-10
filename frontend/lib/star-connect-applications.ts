import {
  COMMUNITY_MONTHLY_PRICE,
  DAY_PASS_PRICE,
  FIVE_DAY_PACK_PRICE,
  TEAM_COMMUNITY_MIN_SEATS,
  TEAM_COMMUNITY_PRICE,
  TEN_DAY_PACK_PRICE,
  VIRTUAL_OFFICE_PRICE,
  formatKes,
} from "@/lib/workspace-pricing"
import {
  STAR_CONNECT_PLAN_NAME,
  STAR_CONNECT_PRIMARY_NEEDS,
  TARGET_START,
  WORKSPACE_NEEDS,
} from "@/lib/membership-inquiry"

export const STAR_CONNECT_APPLICATION_IDS = [
  "community-monthly",
  "flex",
  "virtual-office",
  "team-community",
] as const

export type StarConnectApplicationId = (typeof STAR_CONNECT_APPLICATION_IDS)[number]

export const TEAM_SIZE_OPTIONS = [
  `${TEAM_COMMUNITY_MIN_SEATS}–6 people`,
  "7–10 people",
  "11–20 people",
  "20+ people",
] as const

const FLEX_WORKSPACE_NEEDS = [
  `Day Pass — ${formatKes(DAY_PASS_PRICE)} per day + VAT`,
  `Five-Day Pack — ${formatKes(FIVE_DAY_PACK_PRICE)} + VAT (valid 30 days)`,
  `Ten-Day Flex Pack — ${formatKes(TEN_DAY_PACK_PRICE)} + VAT (valid 30 days)`,
  "A mix of day passes and packs",
] as const

const VIRTUAL_WORKSPACE_NEEDS = [
  "Mailing address and mail collection only",
  "Address plus occasional coworking",
  "Address plus meeting rooms and events",
  "Exploring virtual now, physical workspace later",
] as const

const TEAM_WORKSPACE_NEEDS = [
  "Team Community — flexible coworking seats",
  "Private Team Room — lockable room",
  "Mix of team coworking and a private room",
  "Still deciding between Team Community and a private room",
] as const

const FLEX_PRIMARY_NEEDS = [
  "Flexible coworking days",
  "Indoor or garden seating",
  "Meeting rooms",
  "Community events & mixers",
  "Member-rate bookings",
  "Business development & advisory",
  "Community & peer network",
  "Global Impact Hub Passport (117 hubs, 68 countries)",
] as const

const VIRTUAL_PRIMARY_NEEDS = [
  "Professional business / mailing address",
  "Mail and package handling",
  "Registered-office support (if legally suitable)",
  "Occasional coworking or meeting rooms",
  "Community directory presence",
  "Networking events",
  "Member-rate bookings",
  "Community & peer network",
] as const

const TEAM_PRIMARY_NEEDS = [
  "Flexible team coworking",
  "Private lockable team room",
  "Pooled meeting-room hours",
  "Team onboarding & named contact",
  "Business development & advisory",
  "Acceleration & thematic programs",
  "Community & peer network",
  "Global Impact Hub Passport (117 hubs, 68 countries)",
] as const

export type StarConnectApplicationConfig = {
  id: StarConnectApplicationId
  /** URL slug used in ?plan= */
  slug: StarConnectApplicationId
  /** Short chip on the apply page */
  shortLabel: string
  /** Product name in headings and emails */
  productName: string
  priceLabel: string
  pageTitle: string
  pageIntro: string
  step2Intro: string
  supportLabel: string
  supportPlaceholder: string
  workspaceLabel: string
  workspacePlaceholder: string
  primaryNeedsLabel: string
  submitLabel: string
  confirmationTitle: string
  confirmationLead: string
  staffLead: string
  requiresTeamSize: boolean
  primaryNeeds: readonly string[]
  workspaceNeeds: readonly string[]
}

export const STAR_CONNECT_APPLICATIONS: Record<
  StarConnectApplicationId,
  StarConnectApplicationConfig
> = {
  "community-monthly": {
    id: "community-monthly",
    slug: "community-monthly",
    shortLabel: "Monthly",
    productName: "Community Monthly",
    priceLabel: `${formatKes(COMMUNITY_MONTHLY_PRICE)} per person / month + VAT`,
    pageTitle: "Apply for Community Monthly",
    pageIntro: "Individual Star Connect membership · 3 days per week coworking",
    step2Intro: "Help us understand how Community Monthly can support you.",
    supportLabel: "What support do you need most right now?",
    supportPlaceholder: "e.g. introductions, program fit, workspace setup…",
    workspaceLabel: "Workspace",
    workspacePlaceholder: "How often?",
    primaryNeedsLabel: "I'm interested in…",
    submitLabel: "Submit application",
    confirmationTitle: "You're on the list",
    confirmationLead:
      "We review every Community Monthly application personally and will follow up with next steps.",
    staffLead: "New Community Monthly (Star Connect) membership request",
    requiresTeamSize: false,
    primaryNeeds: STAR_CONNECT_PRIMARY_NEEDS,
    workspaceNeeds: WORKSPACE_NEEDS,
  },
  flex: {
    id: "flex",
    slug: "flex",
    shortLabel: "Flex",
    productName: "Flex coworking",
    priceLabel: `Day Pass ${formatKes(DAY_PASS_PRICE)} · packs from ${formatKes(FIVE_DAY_PACK_PRICE)} + VAT`,
    pageTitle: "Apply for Flex coworking",
    pageIntro: "Day Pass, Five-Day Pack, or Ten-Day Flex Pack under Star Connect",
    step2Intro: "Tell us which Flex option you need and how you plan to use the Hub.",
    supportLabel: "How will you use Flex days?",
    supportPlaceholder: "e.g. client days in Nairobi, hybrid weeks, a project sprint…",
    workspaceLabel: "Flex option",
    workspacePlaceholder: "Which pack?",
    primaryNeedsLabel: "I'm looking for…",
    submitLabel: "Submit Flex application",
    confirmationTitle: "Flex request received",
    confirmationLead:
      "We'll confirm pack availability and how Flex access works, then share next steps.",
    staffLead: "New Flex coworking (Star Connect) request",
    requiresTeamSize: false,
    primaryNeeds: FLEX_PRIMARY_NEEDS,
    workspaceNeeds: FLEX_WORKSPACE_NEEDS,
  },
  "virtual-office": {
    id: "virtual-office",
    slug: "virtual-office",
    shortLabel: "Virtual",
    productName: "Virtual Office Address",
    priceLabel: `${formatKes(VIRTUAL_OFFICE_PRICE)} per year + VAT`,
    pageTitle: "Apply for a Virtual Office",
    pageIntro: "Professional address and mail handling without a permanent desk",
    step2Intro: "Tell us how you want to use the Virtual Office address and mail service.",
    supportLabel: "What do you need the Virtual Office for?",
    supportPlaceholder: "e.g. company registration, client correspondence, Nairobi presence…",
    workspaceLabel: "How you'll use it",
    workspacePlaceholder: "Select an option",
    primaryNeedsLabel: "I need…",
    submitLabel: "Submit Virtual Office application",
    confirmationTitle: "Virtual Office request received",
    confirmationLead:
      "We'll confirm address and mail-handling details, then share the agreement and payment steps.",
    staffLead: "New Virtual Office (Star Connect) request",
    requiresTeamSize: false,
    primaryNeeds: VIRTUAL_PRIMARY_NEEDS,
    workspaceNeeds: VIRTUAL_WORKSPACE_NEEDS,
  },
  "team-community": {
    id: "team-community",
    slug: "team-community",
    shortLabel: "Team",
    productName: "Team Community",
    priceLabel: `${formatKes(TEAM_COMMUNITY_PRICE)} per person / month + VAT · min ${TEAM_COMMUNITY_MIN_SEATS} people`,
    pageTitle: "Apply for Team Community",
    pageIntro: "Flexible team coworking or a private room under Star Connect",
    step2Intro: "Tell us about the team size and the workspace setup you need.",
    supportLabel: "What does the team need from the Hub?",
    supportPlaceholder: "e.g. hybrid seating, a lockable room, pooled meeting hours…",
    workspaceLabel: "Team workspace",
    workspacePlaceholder: "Which setup?",
    primaryNeedsLabel: "The team is looking for…",
    submitLabel: "Submit team application",
    confirmationTitle: "Team application received",
    confirmationLead:
      "We'll review seat numbers and room options, then follow up with a proposed setup.",
    staffLead: "New Team Community (Star Connect) membership request",
    requiresTeamSize: true,
    primaryNeeds: TEAM_PRIMARY_NEEDS,
    workspaceNeeds: TEAM_WORKSPACE_NEEDS,
  },
}

const PLAN_ALIASES: Record<string, StarConnectApplicationId> = {
  monthly: "community-monthly",
  "community-monthly": "community-monthly",
  "dedicated-desk": "community-monthly",
  flex: "flex",
  "day-pass": "flex",
  "five-day-pack": "flex",
  "ten-day-pack": "flex",
  virtual: "virtual-office",
  "virtual-office": "virtual-office",
  team: "team-community",
  "team-community": "team-community",
  "private-team-room": "team-community",
}

const OPTION_TO_WORKSPACE: Record<string, string> = {
  "day-pass": FLEX_WORKSPACE_NEEDS[0],
  "five-day-pack": FLEX_WORKSPACE_NEEDS[1],
  "ten-day-pack": FLEX_WORKSPACE_NEEDS[2],
  "dedicated-desk": WORKSPACE_NEEDS[0],
  "private-team-room": TEAM_WORKSPACE_NEEDS[1],
  "team-community": TEAM_WORKSPACE_NEEDS[0],
}

export function parseStarConnectApplicationId(
  raw: string | null | undefined
): StarConnectApplicationId {
  const key = raw?.trim().toLowerCase() ?? ""
  return PLAN_ALIASES[key] ?? "community-monthly"
}

export function getStarConnectApplication(
  id: string | null | undefined
): StarConnectApplicationConfig {
  return STAR_CONNECT_APPLICATIONS[parseStarConnectApplicationId(id)]
}

export function starConnectApplyPath(
  plan: StarConnectApplicationId,
  option?: string | null
): string {
  const params = new URLSearchParams({ plan })
  if (option) params.set("option", option)
  return `/membership/star-connect?${params.toString()}`
}

export function workspaceNeedForOption(option: string | null | undefined): string | undefined {
  if (!option) return undefined
  return OPTION_TO_WORKSPACE[option.trim().toLowerCase()]
}

export function formatStarConnectPlanLine(config: StarConnectApplicationConfig): string {
  return `${STAR_CONNECT_PLAN_NAME} · ${config.productName}`
}

export const STAR_CONNECT_APPLICATION_SWITCHER: {
  id: StarConnectApplicationId
  label: string
}[] = [
  { id: "community-monthly", label: "Monthly" },
  { id: "flex", label: "Flex" },
  { id: "virtual-office", label: "Virtual" },
  { id: "team-community", label: "Team" },
]

export { TARGET_START }
