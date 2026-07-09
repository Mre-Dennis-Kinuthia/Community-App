/** Organisational membership — application then platform account */
export const ORGANISATIONAL_PLAN_NAME = "Organisational"
export const ORGANISATIONAL_MEMBERSHIP_PATH = "/membership/organisational"
export const ORGANISATIONAL_REGISTER_PATH = "/register?intent=organisational"
export const ORGANISATIONAL_RESPONSE_SLA = "within 2 business days"
export const ORGANISATIONAL_DISCOVERY_CALL_URL =
  "https://calendar.app.google/9ZM6DNGjKgkTC88D7"

export const ORGANISATION_TYPES = [
  "NGO / Non-profit",
  "Foundation / Philanthropy",
  "Corporate / Private sector",
  "Government / Public sector",
  "University / Research institution",
  "Multilateral / Development agency",
  "Network / Association",
  "Other",
] as const

export const ORGANISATION_TEAM_SIZES = [
  "1–5 people",
  "6–20 people",
  "21–50 people",
  "51–200 people",
  "200+ people",
] as const

/** Institutional contact roles — distinct from founder/venture PRIMARY_ROLES */
export const ORGANISATIONAL_CONTACT_ROLES = [
  "Partnerships / Business development",
  "Program / Project director",
  "CSR / Sustainability lead",
  "Executive / Leadership",
  "Research / Academic lead",
  "Communications / Community",
  "Government / Policy liaison",
  "Other",
] as const

export const ORGANISATIONAL_GEOGRAPHIC_SCOPE = [
  "Nairobi & local ecosystem",
  "Kenya national",
  "East Africa regional",
  "Africa-wide",
  "Global / multi-country",
] as const

/** How the institution wants to engage with Impact Hub Nairobi */
export const ORGANISATIONAL_ENGAGEMENT_MODELS = [
  "Co-design & co-deliver programs",
  "Sponsor or fund initiatives",
  "Host events & activations",
  "Staff / team workspace access",
  "Venture pipeline & deal flow",
  "Research & knowledge partnership",
  "Ecosystem convening",
  "Visibility & brand alignment",
] as const

/** Communities the partner wants to reach through IHN */
export const ORGANISATIONAL_AUDIENCE_REACH = [
  "Early-stage entrepreneurs",
  "Growth-stage ventures",
  "Investors & funders",
  "Youth & students",
  "Researchers & academics",
  "Policy & public sector",
  "Corporate innovators",
  "NGOs & civil society",
] as const

export const ORGANISATIONAL_ENGAGEMENT_TIMELINE = [
  "Exploratory — initial conversation",
  "Within 1–3 months",
  "Next quarter (3–6 months)",
  "6–12 month program cycle",
  "Multi-year / ongoing partnership",
] as const

export const ORGANISATIONAL_BUDGET_BANDS = [
  "Exploring — budget not confirmed",
  "Under KES 500,000",
  "KES 500,000 – 2 million",
  "KES 2 – 10 million",
  "KES 10 million+",
  "Prefer to discuss on call",
] as const

/** @deprecated Use ORGANISATIONAL_ENGAGEMENT_MODELS — kept for reference only */
export const ORGANISATIONAL_PARTNERSHIP_INTERESTS = ORGANISATIONAL_ENGAGEMENT_MODELS

/** Star Connect membership application — shared constants */
export const STAR_CONNECT_PLAN_NAME = "Star Connect"
export const STAR_CONNECT_PRICE_LABEL = "KES 13,000 / month"
export const STAR_CONNECT_DISCOVERY_CALL_URL =
  "https://calendar.app.google/9ZM6DNGjKgkTC88D7"
export const STAR_CONNECT_RESPONSE_SLA = "within 2 hours"

export const VENTURE_STAGES = [
  "Idea / pre-launch",
  "Early stage (0–2 years)",
  "Growth stage",
  "Scaling / established",
] as const

export const WORKSPACE_NEEDS = [
  "Full-time on-site",
  "Several days per week",
  "Occasional drop-in",
  "Events & programs only",
  "Primarily remote / Passport only",
] as const

export const TARGET_START = [
  "Ready to start immediately",
  "Within 2 weeks",
  "Within 1 month",
  "In 1–3 months",
  "Still exploring timing",
] as const

export const STAR_CONNECT_PRIMARY_NEEDS = [
  "Business development & advisory",
  "Workspace & meeting rooms",
  "Global Impact Hub Passport (120+ hubs)",
  "Acceleration & thematic programs",
  "Investor & grant introductions",
  "Strategic partnerships",
  "Mentorship",
  "Community & peer network",
] as const

export const HOW_HEARD_OPTIONS = [
  "Impact Hub event",
  "Referral from a member",
  "Social media",
  "Partner organization",
  "Google / search",
  "Other",
] as const
