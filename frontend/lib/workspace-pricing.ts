/** Published Impact Hub Nairobi workspace prices. Amounts exclude 16% VAT.
 * Keep in sync with Community-app-admin/lib/workspace-pricing.ts
 */

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
export const PASTRIES_PRICE_PER_PAX = 400

export function formatKes(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`
}

/** Platform membership the workspace category sits under. */
export type MembershipPricingId = "community" | "star_connect" | "organisational"

export type WorkspacePricingCategory = {
  id: string
  membershipId: MembershipPricingId
  optionGroup: "flex" | "individual" | "team"
  name: string
  shortName: string
  chipLabel: string
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
  /** One line: who this membership is for */
  audience: string
  intro: string
  helper: string
  popular: boolean
  /** Paid workspace options. Connect and Organisation have none. */
  defaultCategoryId: string | null
  href: string
  cta: string
  /** Shown when this membership has no workspace dropdown */
  staticPrice?: string
  coworkingDays?: string
  includes?: string[]
}

export const MEMBERSHIP_PRICING_TIERS: MembershipPricingTier[] = [
  {
    id: "community",
    name: "Connect",
    audience: "Community access",
    intro: "Join the community on the platform at no cost.",
    helper: "Register · no membership fee",
    popular: false,
    defaultCategoryId: null,
    href: "/register",
    cta: "Create free account",
    staticPrice: "Free",
    includes: [
      "Community app, member directory and newsletter",
      "Invitations to events, office hours and mixers",
      "Member-rate room bookings",
      "Workspace available at Star Connect rates",
    ],
  },
  {
    id: "star_connect",
    name: "Star Connect",
    audience: "Workspace",
    intro: "Choose a workspace option to see price, coworking days and what’s included.",
    helper: "2-step application · we typically respond within 2 hours",
    popular: true,
    defaultCategoryId: "community-monthly",
    href: "/membership/star-connect",
    cta: "Apply for Star Connect",
  },
  {
    id: "organisational",
    name: "Organisation / Company",
    audience: "Partnerships",
    intro: "Co-design programmes, events and ecosystem work with Impact Hub Nairobi.",
    helper: "3-step inquiry · we typically respond within 2 business days",
    popular: false,
    defaultCategoryId: null,
    href: "/membership/organisational",
    cta: "Start partnership inquiry",
    staticPrice: "Custom",
    includes: [
      "Co-designed programmes, events and ecosystem partnerships",
      "Named organisational contact",
      "Scope and pricing agreed with the partnerships team",
      "Access to Nairobi’s impact community and the global Impact Hub network",
    ],
  },
]

export const WORKSPACE_PRICING_CATEGORIES: WorkspacePricingCategory[] = [
  {
    id: "day-pass",
    membershipId: "star_connect",
    optionGroup: "flex",
    name: "Day Pass",
    shortName: "Day Pass",
    chipLabel: "Day Pass",
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
    membershipId: "star_connect",
    optionGroup: "flex",
    name: "Five-Day Pack",
    shortName: "Five-Day Pack",
    chipLabel: "5-Day",
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
    membershipId: "star_connect",
    optionGroup: "flex",
    name: "Ten-Day Flex Pack",
    shortName: "Ten-Day Pack",
    chipLabel: "10-Day",
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
    id: "community-monthly",
    membershipId: "star_connect",
    optionGroup: "individual",
    name: "Community Monthly — Individual",
    shortName: "Community Monthly",
    chipLabel: "Monthly",
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
    optionGroup: "individual",
    name: "Dedicated Desk — Resident",
    shortName: "Dedicated Desk",
    chipLabel: "Dedicated",
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
    membershipId: "star_connect",
    optionGroup: "team",
    name: "Team Community",
    shortName: "Team Community",
    chipLabel: "Team",
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
    href: "/membership/star-connect",
    cta: "Enquire about Team Community",
    note: `Minimum ${TEAM_COMMUNITY_MIN_SEATS} people.`,
  },
  {
    id: "office-for-a-day",
    membershipId: "star_connect",
    optionGroup: "team",
    name: "Office for a Day",
    shortName: "Office for a Day",
    chipLabel: "Office day",
    coworkingDays: "1 private-office day",
    priceAmount: OFFICE_FOR_A_DAY_PRICE,
    pricePeriod: "per day + VAT",
    priceLabel: `${formatKes(OFFICE_FOR_A_DAY_PRICE)} per day + VAT`,
    bestFor: "Small teams that need a private office for one day.",
    includes: [
      "A private furnished room",
      "Weekday access from 8:00 a.m. to 6:00 p.m.",
      `Additional team member: ${formatKes(OFFICE_FOR_A_DAY_EXTRA_PERSON_PRICE)} per person + VAT, subject to the room’s capacity`,
    ],
    href: "/booking",
    cta: "Book an office for a day",
  },
  {
    id: "private-team-room",
    membershipId: "star_connect",
    optionGroup: "team",
    name: "Private Team Room — Small-Team",
    shortName: "Private Team Room",
    chipLabel: "Private room",
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
    href: "/membership/star-connect",
    cta: "Enquire about a private room",
    note: "Final price depends on the room’s capacity and configuration.",
  },
  {
    id: "virtual-office",
    membershipId: "star_connect",
    optionGroup: "team",
    name: "Virtual Office Address",
    shortName: "Virtual Office",
    chipLabel: "Virtual",
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
    href: "/membership/star-connect",
    cta: "Enquire about a virtual office",
    note: "Optional extras include printing, registered-office support where legally suitable, event production, advisory and partner introductions.",
  },
]

export const WORKSPACE_OPTION_GROUPS: {
  id: WorkspacePricingCategory["optionGroup"]
  label: string
  toggleLabel: string
}[] = [
  { id: "flex", label: "Flexible coworking", toggleLabel: "Flex" },
  { id: "individual", label: "Individual membership", toggleLabel: "Member" },
  { id: "team", label: "Team workspace", toggleLabel: "Team" },
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

export function workspaceOptionLabel(category: WorkspacePricingCategory): string {
  return `${category.shortName} · ${formatWorkspacePrice(category)}`
}

export const MEETING_ROOM_HOURLY_PRICE = 1500
export const HALF_DAY_ROOM_PRICE = 5000
export const FULL_DAY_ROOM_PRICE = 9000
export const HALF_DAY_CONFERENCE_PRICE = 3000
export const FULL_DAY_CONFERENCE_PRICE = 3250
export const CONFERENCE_MIN_PAX = 6

export const MEETING_ROOM_PACKAGE_IDS = [
  "hourly",
  "half-day-room",
  "full-day-room",
  "half-day-conference",
  "full-day-conference",
] as const

export type MeetingRoomPackageId = (typeof MEETING_ROOM_PACKAGE_IDS)[number]

export type MeetingRoomBilling = "hourly" | "fixed" | "per_person"

export type MeetingRoomPackage = {
  id: MeetingRoomPackageId
  name: string
  price: number
  pricePeriod: string
  billing: MeetingRoomBilling
  defaultHours: number
  minPax?: number
  description: string
}

export const MEETING_ROOM_PACKAGES: MeetingRoomPackage[] = [
  {
    id: "hourly",
    name: "Meeting Room",
    price: MEETING_ROOM_HOURLY_PRICE,
    pricePeriod: "/ hour + VAT",
    billing: "hourly",
    defaultHours: 1,
    description: "4–6 people • screen/HDMI • member rates available",
  },
  {
    id: "half-day-room",
    name: "Half-Day Room",
    price: HALF_DAY_ROOM_PRICE,
    pricePeriod: "room only + VAT",
    billing: "fixed",
    defaultHours: 4,
    description: "Up to four hours • room only • refreshments available up to 30 pax",
  },
  {
    id: "full-day-room",
    name: "Full-Day Room",
    price: FULL_DAY_ROOM_PRICE,
    pricePeriod: "room only + VAT",
    billing: "fixed",
    defaultHours: 8,
    description: "Up to eight hours • room only • refreshments available up to 30 pax",
  },
  {
    id: "half-day-conference",
    name: "Half-Day Conference",
    price: HALF_DAY_CONFERENCE_PRICE,
    pricePeriod: "/ person + VAT",
    billing: "per_person",
    defaultHours: 4,
    minPax: CONFERENCE_MIN_PAX,
    description: "Minimum 6 • breakfast or snack + lunch",
  },
  {
    id: "full-day-conference",
    name: "Full-Day Conference",
    price: FULL_DAY_CONFERENCE_PRICE,
    pricePeriod: "/ person + VAT",
    billing: "per_person",
    defaultHours: 8,
    minPax: CONFERENCE_MIN_PAX,
    description: "Minimum 6 • breakfast or snack + lunch",
  },
]

export function meetingRoomPackageById(
  id: string | null | undefined
): MeetingRoomPackage | undefined {
  if (!id) return undefined
  return MEETING_ROOM_PACKAGES.find((pkg) => pkg.id === id)
}

export function storedMeetingRoomRates(
  pricing: unknown
): Partial<Record<MeetingRoomPackageId, number>> {
  if (!pricing || typeof pricing !== "object") return {}
  const room = (pricing as Record<string, unknown>)["meeting-room"]
  if (!room || typeof room !== "object") return {}
  const rates: Partial<Record<MeetingRoomPackageId, number>> = {}
  for (const pkg of MEETING_ROOM_PACKAGES) {
    const value = (room as Record<string, unknown>)[pkg.id]
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      rates[pkg.id] = value
    }
  }
  return rates
}

export function packageUnitPrice(
  id: MeetingRoomPackageId,
  rateOverrides?: Partial<Record<MeetingRoomPackageId, number>>
): number {
  return rateOverrides?.[id] ?? meetingRoomPackageById(id)?.price ?? 0
}

export function quoteMeetingRoomPackage(
  id: MeetingRoomPackageId,
  hours: number,
  pax: number,
  rateOverrides?: Partial<Record<MeetingRoomPackageId, number>>
): { hours: number; basePrice: number } {
  const pkg = meetingRoomPackageById(id)
  if (!pkg) return { hours: 1, basePrice: 0 }
  const unitPrice = packageUnitPrice(id, rateOverrides)
  const resolvedHours = pkg.billing === "hourly"
    ? Math.min(8, Math.max(1, Math.round(hours)))
    : pkg.defaultHours
  if (pkg.billing === "hourly") {
    return { hours: resolvedHours, basePrice: unitPrice * resolvedHours }
  }
  if (pkg.billing === "per_person") {
    const headcount = Math.max(pkg.minPax ?? CONFERENCE_MIN_PAX, Math.round(pax))
    return { hours: resolvedHours, basePrice: unitPrice * headcount }
  }
  return { hours: resolvedHours, basePrice: unitPrice }
}

export function meetingRoomDurationForPackage(
  id: MeetingRoomPackageId
): "hourly" | "half-day" | "full-day" {
  if (id === "hourly") return "hourly"
  if (id === "half-day-room" || id === "half-day-conference") return "half-day"
  return "full-day"
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
