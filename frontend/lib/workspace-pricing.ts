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

export type WorkspacePricingGroup = "flex" | "membership" | "dedicated"

export type WorkspacePricingCategory = {
  id: string
  group: WorkspacePricingGroup
  name: string
  priceLabel: string
  validity?: string
  bestFor: string
  includes: string[]
  href?: string
  note?: string
}

export const WORKSPACE_PRICING_GROUPS: {
  id: WorkspacePricingGroup
  label: string
  description: string
}[] = [
  {
    id: "flex",
    label: "Flexible coworking",
    description: "Pay for the days you need — weekday access 8:00 a.m. to 6:00 p.m.",
  },
  {
    id: "membership",
    label: "Monthly memberships",
    description: "These map to Star Connect and Organisation / Company on the platform.",
  },
  {
    id: "dedicated",
    label: "Dedicated & on-demand",
    description: "A permanent desk, a private room, or a professional address.",
  },
]

export const WORKSPACE_PRICING_CATEGORIES: WorkspacePricingCategory[] = [
  {
    id: "day-pass",
    group: "flex",
    name: "Day Pass",
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
  },
  {
    id: "five-day-pack",
    group: "flex",
    name: "Five-Day Pack",
    priceLabel: `${formatKes(FIVE_DAY_PACK_PRICE)} + VAT`,
    validity: "Five coworking days, valid for 30 days",
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
  },
  {
    id: "ten-day-pack",
    group: "flex",
    name: "Ten-Day Flex Pack",
    priceLabel: `${formatKes(TEN_DAY_PACK_PRICE)} + VAT`,
    validity: "Ten coworking days, valid for 30 days",
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
  },
  {
    id: "community-monthly",
    group: "membership",
    name: "Community Monthly — Individual",
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
    note: "This is the Star Connect membership on the platform.",
  },
  {
    id: "team-community",
    group: "membership",
    name: "Team Community",
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
    note: `Minimum ${TEAM_COMMUNITY_MIN_SEATS} people. This is the Organisation / Company workspace rate.`,
  },
  {
    id: "dedicated-desk",
    group: "dedicated",
    name: "Dedicated Desk — Resident",
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
  },
  {
    id: "private-team-room",
    group: "dedicated",
    name: "Private Team Room — Small-Team",
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
    note: "Final price depends on the room’s capacity and configuration.",
  },
  {
    id: "office-for-a-day",
    group: "dedicated",
    name: "Office for a Day",
    priceLabel: `${formatKes(OFFICE_FOR_A_DAY_PRICE)} per day + VAT`,
    bestFor: "Individuals or small teams that need a private office temporarily.",
    includes: [
      "A private furnished room",
      "Weekday access from 8:00 a.m. to 6:00 p.m.",
      `Additional team member: ${formatKes(OFFICE_FOR_A_DAY_EXTRA_PERSON_PRICE)} per person + VAT, subject to the room’s capacity`,
    ],
    href: "/booking",
  },
  {
    id: "virtual-office",
    group: "dedicated",
    name: "Virtual Office Address",
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
    note: "Optional extras include printing, registered-office support where legally suitable, event production, advisory and partner introductions.",
  },
]

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
