import {
  Award,
  Building2,
  Globe,
  Handshake,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import type { Partner, PartnersListResponse } from "@/types/partner"

export const PARTNER_TYPE_ICONS: Record<string, LucideIcon> = {
  "Workspace Partner": Building2,
  Investor: TrendingUp,
  Partner: Handshake,
  Funder: Award,
  Government: Building2,
  Network: Globe,
}

export const PARTNER_TYPE_STYLES: Record<string, string> = {
  "Workspace Partner": "bg-muted text-muted-foreground border border-border",
  Investor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
  Partner: "bg-primary/10 text-primary border border-primary/20",
  Funder: "bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20",
  Government: "bg-muted text-muted-foreground border border-border",
  Network: "bg-sky-500/10 text-sky-800 dark:text-sky-400 border border-sky-500/20",
}

export const PARTNER_CATEGORY_STYLES: Record<string, string> = {
  Infrastructure: "bg-muted text-muted-foreground border border-border",
  Funding: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
  Ecosystem: "bg-primary/10 text-primary border border-primary/20",
  "Public Sector": "bg-muted text-muted-foreground border border-border",
}

export const PARTNER_OPPORTUNITY_CATEGORY_STYLES: Record<string, string> = {
  Funding: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
  Program: "bg-primary/10 text-primary border border-primary/20",
  Resource: "bg-muted text-muted-foreground border border-border",
}

export function getPartnerTypeIcon(type: string | null | undefined): LucideIcon {
  if (!type) return Building2
  return PARTNER_TYPE_ICONS[type] ?? Building2
}

type RawPartner = {
  id: string
  name: string
  type?: string | null
  category?: string | null
  description?: string | null
  logoUrl?: string | null
  website?: string | null
  location?: string | null
  locationType?: string | null
  focus?: string[] | null
  contactEmail?: string | null
  isFeatured?: boolean | null
  createdAt: string | Date
  opportunitiesCount?: number
  _count?: { opportunities?: number }
  opportunities?: Partner["opportunities"]
}

export function normalizePartner(raw: RawPartner): Partner {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type ?? "Partner",
    category: raw.category ?? "",
    description: raw.description ?? "",
    logoUrl: raw.logoUrl ?? null,
    website: raw.website ?? null,
    location: raw.location ?? null,
    locationType: raw.locationType ?? "",
    focus: raw.focus ?? [],
    contactEmail: raw.contactEmail ?? null,
    isFeatured: raw.isFeatured ?? false,
    createdAt:
      raw.createdAt instanceof Date ? raw.createdAt.toISOString() : String(raw.createdAt),
    opportunitiesCount:
      raw.opportunitiesCount ?? raw._count?.opportunities ?? raw.opportunities?.length ?? 0,
    opportunities: raw.opportunities,
  }
}

export function normalizePartnersResponse(data: {
  partners?: RawPartner[]
  total?: number
  filters?: PartnersListResponse["filters"]
}): PartnersListResponse {
  const partners = (data.partners ?? []).map(normalizePartner)
  return {
    partners: sortPartners(partners),
    total: data.total ?? partners.length,
    filters: data.filters ?? { types: [], categories: [], locationTypes: [] },
  }
}

export function sortPartners(partners: Partner[]): Partner[] {
  return [...partners].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export function countInvestorPartners(partners: Partner[]): number {
  return partners.filter((p) => p.type === "Investor" || p.type === "Funder").length
}

export function sumPartnerOpportunities(partners: Partner[]): number {
  return partners.reduce((sum, p) => sum + p.opportunitiesCount, 0)
}

export function partnerMailto(
  email: string,
  subject: string,
  body?: string
): string {
  const params = new URLSearchParams()
  params.set("subject", subject)
  if (body) params.set("body", body)
  return `mailto:${email}?${params.toString()}`
}
