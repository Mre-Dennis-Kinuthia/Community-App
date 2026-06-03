export type PartnerType =
  | "Workspace Partner"
  | "Investor"
  | "Partner"
  | "Funder"
  | "Government"
  | "Network"

export type PartnerCategory =
  | "Infrastructure"
  | "Funding"
  | "Ecosystem"
  | "Public Sector"

export type PartnerLocationType = "Local" | "Global"

export interface PartnerOpportunity {
  id: string
  title: string
  description: string
  category: string | null
  amount: string | null
  deadline: string | null
  eligibility: string[]
  applicationProcess: string[]
  status: string
  createdAt: string
}

export interface Partner {
  id: string
  name: string
  type: string
  category: string
  description: string
  logoUrl: string | null
  website: string | null
  location: string | null
  locationType: string
  focus: string[]
  contactEmail: string | null
  isFeatured: boolean
  createdAt: string
  opportunitiesCount: number
  opportunities?: PartnerOpportunity[]
}

export interface PartnersListResponse {
  partners: Partner[]
  total: number
  filters: {
    types: string[]
    categories: string[]
    locationTypes: string[]
  }
}
