/** Published Impact Hub Nairobi workspace prices. Amounts exclude 16% VAT. */

export const VAT_RATE = 0.16
export const VAT_DISCLAIMER =
  "All prices exclude 16% VAT and are subject to availability, onboarding and the applicable membership agreement."

export const DAY_PASS_PRICE = 1500
export const FIVE_DAY_PACK_PRICE = 6500
export const TEN_DAY_PACK_PRICE = 10500
export const COMMUNITY_MONTHLY_PRICE = 15000
export const TEAM_COMMUNITY_PRICE = 11500
export const TEAM_COMMUNITY_MIN_SEATS = 4
export const DEDICATED_DESK_PRICE = 18000
export const PRIVATE_TEAM_ROOM_FROM_PRICE = 60000
export const OFFICE_FOR_A_DAY_PRICE = 3000
export const OFFICE_FOR_A_DAY_EXTRA_PERSON_PRICE = 2250
export const VIRTUAL_OFFICE_PRICE = 24000

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`
}

/** Platform membership the workspace category sits under. */
export type MembershipPricingId = "community" | "star_connect" | "organisational"

export type WorkspacePricingCategory = {
  id: string
  membershipId: MembershipPricingId
  name: string
  shortName: string
  /** Coworking days included or how access is counted */
  coworkingDays: string
  priceAmount: number
  priceFrom?: boolean
  pricePeriod: string
  priceLabel: string
  validity?: string
  bestFor: string
  includes: string[]
  href: string
  cta: string
  note?: string
}

export type MembershipPricingTier = {
  id: MembershipPricingId
  name: string
  defaultCategoryId: string
  intro: string
  helper: string
  popular: boolean
}

export const MEMBERSHIP_PRICING_TIERS: MembershipPricingTier[] = [
  {
    id: "community",
    name: "Connect",
    defaultCategoryId: "day-pass",
    intro:
      "Free platform membership. Pick a workspace category to see the day rate, pack size and coworking days.",
    helper: "Register on the platform · no membership fee",
    popular: false,
  },
  {
    id: "star_connect",
    name: "Star Connect",
    defaultCategoryId: "community-monthly",
    intro:
      "Individual membership. Switch category to compare Community Monthly with a dedicated desk.",
    helper: "2-step application · we typically respond within 2 hours",
    popular: true,
  },
  {
    id: "organisational",
    name: "Organisation / Company",
    defaultCategoryId: "team-community",
    intro:
      "Team and institutional options. Choose a category to see per-person rates, private rooms or a virtual office.",
    helper: `Minimum ${TEAM_COMMUNITY_MIN_SEATS} people for Team Community · partnership inquiry for custom scope`,
    popular: false,
  },
]

export const WORKSPACE_PRICING_CATEGORIES: WorkspacePricingCategory[] = [
  {
    id: "day-pass",
    membershipId: "community",
    name: "Day Pass",
    shortName: "Day Pass",
    coworkingDays: "1 coworking day",
    priceAmount: DAY_PASS_PRICE,
    pricePeriod: "per day + VAT",
    priceLabel: `${formatKes(DAY_PASS_PRICE)} per day + VAT`,
    bestFor: "Occasional users who need a professional workspace for one day.",
    includes: [
      "Weekday access from 8:00 a.m. to 6:00 p.m.",
      "Available indoor or garden seating",
      "High-speed Wi-Fi with backup",
      "Self-service tea, house coffee and filtered water",
      "Support from the community host",
      "Access to member-rate room bookings",
    ],
    href: "/booking",
    cta: "Book a Day Pass",
  },
  {
    id: "five-day-pack",
    membershipId: "community",
    name: "Five-Day Pack",
    shortName: "Five-Day Pack",
    coworkingDays: "5 coworking days",
    priceAmount: FIVE_DAY_PACK_PRICE,
    pricePeriod: "per pack + VAT",
    priceLabel: `${formatKes(FIVE_DAY_PACK_PRICE)} + VAT`,
    validity: "Valid for 30 days",
    bestFor: "Hybrid professionals who need a reliable workspace approximately once a week.",
    includes: [
      "Five flexible coworking days",
      "Available indoor or garden seating",
      "High-speed Wi-Fi with backup",
      "Tea, coffee and filtered water",
      "Community host support",
      "Access to member-rate room bookings",
    ],
    href: "/booking",
    cta: "Book a Five-Day Pack",
  },
  {
    id: "ten-day-pack",
    membershipId: "community",
    name: "Ten-Day Flex Pack",
    shortName: "Ten-Day Pack",
    coworkingDays: "10 coworking days",
    priceAmount: TEN_DAY_PACK_PRICE,
    pricePeriod: "per pack + VAT",
    priceLabel: `${formatKes(TEN_DAY_PACK_PRICE)} + VAT`,
    validity: "Valid for 30 days",
    bestFor: "Regular hybrid workers, consultants and professionals undertaking project sprints.",
    includes: [
      "Ten flexible coworking days",
      "Indoor and garden workspaces",
      "High-speed Wi-Fi with backup",
      "Tea, coffee and filtered water",
      "Community host support",
      "Access to member-rate room bookings",
    ],
    href: "/booking",
    cta: "Book a Ten-Day Pack",
  },
  {
    id: "office-for-a-day",
    membershipId: "community",
    name: "Office for a Day",
    shortName: "Office for a Day",
    coworkingDays: "1 private-office day",
    priceAmount: OFFICE_FOR_A_DAY_PRICE,
    pricePeriod: "per day + VAT",
    priceLabel: `${formatKes(OFFICE_FOR_A_DAY_PRICE)} per day + VAT`,
    bestFor: "Individuals or small teams that need a private office temporarily.",
    includes: [
      "A private furnished room",
      "Weekday access from 8:00 a.m. to 6:00 p.m.",
      `Additional team member: ${formatKes(OFFICE_FOR_A_DAY_EXTRA_PERSON_PRICE)} per person + VAT, subject to the room’s capacity`,
    ],
    href: "/booking",
    cta: "Book an office for a day",
  },
  {
    id: "community-monthly",
    membershipId: "star_connect",
    name: "Community Monthly — Individual",
    shortName: "Community Monthly",
    coworkingDays: "3 days per week",
    priceAmount: COMMUNITY_MONTHLY_PRICE,
    pricePeriod: "per person / month + VAT",
    priceLabel: `${formatKes(COMMUNITY_MONTHLY_PRICE)} per person per month + VAT`,
    bestFor:
      "Individual founders, professionals, creatives, researchers and consultants who need regular workspace and community access.",
    includes: [
      "3 days/week standard coworking access during published member hours",
      "Two complimentary meeting-room hours per month",
      "Member rates on meetings, events and production bookings",
      "Access to the community app and member directory",
      "Curated introductions",
      "Selected learning sessions, office hours and networking events",
      "Eligibility for mail and package handling",
    ],
    href: "/membership/star-connect",
    cta: "Apply for Star Connect",
    note: "This is the Star Connect membership on the platform.",
  },
  {
    id: "dedicated-desk",
    membershipId: "star_connect",
    name: "Dedicated Desk — Resident",
    shortName: "Dedicated Desk",
    coworkingDays: "Permanent dedicated desk",
    priceAmount: DEDICATED_DESK_PRICE,
    pricePeriod: "per person / month + VAT",
    priceLabel: `${formatKes(DEDICATED_DESK_PRICE)} per person per month + VAT`,
    bestFor: "Members who want a permanent, personalised workstation.",
    includes: [
      "A dedicated furnished desk",
      "Personal storage",
      "Extended access, subject to security protocols",
      "Four complimentary meeting-room hours",
      "Mail handling",
      "Full community membership benefits",
    ],
    href: "/membership/star-connect",
    cta: "Enquire about a dedicated desk",
  },
  {
    id: "team-community",
    membershipId: "organisational",
    name: "Team Community",
    shortName: "Team Community",
    coworkingDays: "Flexible team coworking",
    priceAmount: TEAM_COMMUNITY_PRICE,
    pricePeriod: "per person / month + VAT",
    priceLabel: `${formatKes(TEAM_COMMUNITY_PRICE)} per person per month + VAT`,
    bestFor:
      "Hybrid teams, organisations and project groups that need flexible seating and shared benefits.",
    includes: [
      "All Community Monthly membership benefits",
      "Preferential membership rate",
      "Pooled meeting-room allowance of two hours per team member",
      "Flexible seating for hybrid teams and project groups",
      "Single team onboarding",
      "Named organisational contact",
      "Priority access to selected team workshops and partner events",
      "Quarterly membership review to increase or reduce seats",
    ],
    href: "/membership/organisational",
    cta: "Start partnership inquiry",
    note: `Minimum ${TEAM_COMMUNITY_MIN_SEATS} people. This is the Organisation / Company workspace rate.`,
  },
  {
    id: "private-team-room",
    membershipId: "organisational",
    name: "Private Team Room — Small-Team",
    shortName: "Private Team Room",
    coworkingDays: "Private lockable room",
    priceAmount: PRIVATE_TEAM_ROOM_FROM_PRICE,
    priceFrom: true,
    pricePeriod: "per month + VAT",
    priceLabel: `From ${formatKes(PRIVATE_TEAM_ROOM_FROM_PRICE)} per month + VAT`,
    bestFor: "Small teams that require privacy, a permanent base and a lockable workspace.",
    includes: [
      "Furnished, lockable private room",
      "Configuration based on team size",
      "Meeting-room credits",
      "Team signage options",
      "Cleaning and utilities",
      "Access to communal spaces",
    ],
    href: "/membership/organisational",
    cta: "Enquire about a private room",
    note: "Final price depends on the room’s capacity and configuration.",
  },
  {
    id: "virtual-office",
    membershipId: "organisational",
    name: "Virtual Office Address",
    shortName: "Virtual Office",
    coworkingDays: "No dedicated coworking days",
    priceAmount: VIRTUAL_OFFICE_PRICE,
    pricePeriod: "per year + VAT",
    priceLabel: `${formatKes(VIRTUAL_OFFICE_PRICE)} per year + VAT`,
    bestFor:
      "Entrepreneurs, consultants and organisations that need a professional business presence without a permanent physical workspace.",
    includes: [
      "Professional business and mailing address",
      "Mail and package collection",
      "Access to networking events",
      "Member rates on desks, meeting rooms and events",
      "Community directory presence, subject to profile approval",
    ],
    href: "/membership/organisational",
    cta: "Enquire about a virtual office",
    note: "Optional extras include printing, registered-office support where legally suitable, event production, advisory and partner introductions.",
  },
]

export function categoriesForMembership(
  membershipId: MembershipPricingId
): WorkspacePricingCategory[] {
  return WORKSPACE_PRICING_CATEGORIES.filter((c) => c.membershipId === membershipId)
}

export function workspaceCategoryById(
  id: string
): WorkspacePricingCategory | undefined {
  return WORKSPACE_PRICING_CATEGORIES.find((c) => c.id === id)
}

export function formatWorkspacePrice(category: WorkspacePricingCategory): string {
  const amount = formatKes(category.priceAmount)
  return category.priceFrom ? `From ${amount}` : amount
}

export const GENERAL_MEMBER_BENEFITS = [
  "High-speed internet",
  "Secure access",
  "Community host support",
  "Tea, coffee and filtered water",
  "Indoor and garden workspaces",
  "Printing and administrative support",
  "Business support",
  "Community events",
  "Member network and curated introductions",
  "Mail and package handling",
  "Impact Hub Global Passport — access to more than 100 Impact Hubs across over 60 countries",
]
