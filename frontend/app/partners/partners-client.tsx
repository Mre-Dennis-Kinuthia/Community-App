"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Loader2, Search, Sparkles, Target, TrendingUp, X } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { FilterChip } from "@/components/mobile/filter-chip"
import { FilterChipRow } from "@/components/mobile/filter-chip-row"
import { MobileSearchBar } from "@/components/mobile/mobile-search-bar"
import { MobileFilterSheet } from "@/components/mobile/mobile-filter-sheet"
import {
  MobilePageHeader,
  MobileStatsStrip,
  MobileFilterMeta,
  MobileBreadcrumbsHidden,
  MobileSearchFilterRow,
} from "@/components/mobile/mobile-page-shell"
import { PartnerCard } from "@/components/partners/partner-card"
import {
  countInvestorPartners,
  normalizePartnersResponse,
  sumPartnerOpportunities,
} from "@/lib/partner-utils"
import type { PartnersListResponse } from "@/types/partner"

export default function PartnersPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all")
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all")
  const [locationFilter, setLocationFilter] = useState(searchParams.get("location") || "all")
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const partnersParams = new URLSearchParams()
  if (searchQuery.trim()) partnersParams.set("search", searchQuery.trim())
  if (typeFilter !== "all") partnersParams.set("type", typeFilter)
  if (categoryFilter !== "all") partnersParams.set("category", categoryFilter)
  if (locationFilter !== "all") partnersParams.set("location", locationFilter)

  const partnersKey = `/api/partners?${partnersParams.toString()}`
  const { data, error, isLoading } = useSWR<PartnersListResponse>(partnersKey, async (url) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to load partners")
    return normalizePartnersResponse(await res.json())
  })

  const partners = data?.partners ?? []
  const filters = data?.filters ?? { types: [], categories: [], locationTypes: [] }
  const featuredPartners = partners.filter((p) => p.isFeatured)
  const regularPartners = partners.filter((p) => !p.isFeatured)

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("search", searchQuery.trim())
    if (typeFilter !== "all") params.set("type", typeFilter)
    if (categoryFilter !== "all") params.set("category", categoryFilter)
    if (locationFilter !== "all") params.set("location", locationFilter)

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, typeFilter, categoryFilter, locationFilter, router])

  const clearFilters = () => {
    setTypeFilter("all")
    setCategoryFilter("all")
    setLocationFilter("all")
    setSearchQuery("")
    router.replace(window.location.pathname, { scroll: false })
  }

  const uniqueTypes =
    filters.types.length > 0
      ? filters.types
      : Array.from(new Set(partners.map((p) => p.type).filter(Boolean)))
  const uniqueCategories =
    filters.categories.length > 0
      ? filters.categories
      : Array.from(new Set(partners.map((p) => p.category).filter(Boolean)))
  const uniqueLocationTypes =
    filters.locationTypes.length > 0
      ? filters.locationTypes
      : Array.from(new Set(partners.map((p) => p.locationType).filter(Boolean)))

  const hasActiveFilters =
    typeFilter !== "all" ||
    categoryFilter !== "all" ||
    locationFilter !== "all" ||
    searchQuery.trim().length > 0

  const activeFilterCount = [
    typeFilter !== "all",
    categoryFilter !== "all",
    locationFilter !== "all",
    searchQuery.trim().length > 0,
  ].filter(Boolean).length

  const advancedFilterCount = [
    typeFilter !== "all",
    categoryFilter !== "all",
    locationFilter !== "all",
  ].filter(Boolean).length

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-5xl space-y-5 overflow-x-hidden md:space-y-8">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs items={[{ label: "Partners & Network" }]} />
        </MobileBreadcrumbsHidden>

        <MobilePageHeader
          title="Partners & network"
          description="Investors, funders, and ecosystem partners supporting social innovation in Kenya and beyond."
        />

        <MobileStatsStrip
          loading={isLoading}
          items={[
            { label: "Partners", value: partners.length, icon: Building2 },
            { label: "Investors", value: countInvestorPartners(partners), icon: TrendingUp },
            { label: "Opportunities", value: sumPartnerOpportunities(partners), icon: Target },
          ]}
        />

        <div className="hidden gap-4 md:grid md:grid-cols-3">
          <Card className="border-border">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total partners</p>
              <p className="mt-1 text-2xl font-semibold">{partners.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Investors & funders</p>
              <p className="mt-1 text-2xl font-semibold">{countInvestorPartners(partners)}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Listed opportunities</p>
              <p className="mt-1 text-2xl font-semibold">{sumPartnerOpportunities(partners)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Mobile filters */}
        <div className="space-y-3 md:hidden">
          <MobileSearchFilterRow
            search={
              <MobileSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search partners…"
              />
            }
            filterTrigger={
              <MobileFilterSheet
                open={filterSheetOpen}
                onOpenChange={setFilterSheetOpen}
                activeCount={advancedFilterCount}
                onClear={clearFilters}
              >
                <div className="space-y-4">
                  <FilterSection label="Type">
                    <FilterChipRow>
                      <FilterChip label="All" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
                      {uniqueTypes.map((t) => (
                        <FilterChip key={t} label={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
                      ))}
                    </FilterChipRow>
                  </FilterSection>
                  <FilterSection label="Category">
                    <FilterChipRow>
                      <FilterChip label="All" active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")} />
                      {uniqueCategories.map((c) => (
                        <FilterChip key={c} label={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
                      ))}
                    </FilterChipRow>
                  </FilterSection>
                  <FilterSection label="Reach">
                    <FilterChipRow>
                      <FilterChip label="All" active={locationFilter === "all"} onClick={() => setLocationFilter("all")} />
                      {uniqueLocationTypes.map((l) => (
                        <FilterChip key={l} label={l} active={locationFilter === l} onClick={() => setLocationFilter(l)} />
                      ))}
                    </FilterChipRow>
                  </FilterSection>
                </div>
              </MobileFilterSheet>
            }
          />
          <MobileFilterMeta
            count={partners.length}
            countLabel="partners"
            filterCount={activeFilterCount}
            hasFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        </div>

        {/* Desktop filters */}
        <div className="hidden flex-col gap-3 md:flex">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, description, or focus area…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Reach" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reach</SelectItem>
                {uniqueLocationTypes.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            ) : null}
          </div>
          {activeFilterCount > 0 ? (
            <Badge variant="secondary">
              {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} applied · {partners.length}{" "}
              result{partners.length !== 1 ? "s" : ""}
            </Badge>
          ) : null}
        </div>

        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <EmptyState
            message={error.message || "Failed to load partners"}
            actionLabel="Retry"
            onAction={() => window.location.reload()}
          />
        ) : partners.length === 0 ? (
          <EmptyState
            message="No partners match your filters."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <div className="space-y-8">
            {featuredPartners.length > 0 ? (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Featured partners
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {featuredPartners.map((partner) => (
                    <PartnerCard key={partner.id} partner={partner} />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-4">
              {featuredPartners.length > 0 ? (
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  All partners
                </h2>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                {(featuredPartners.length > 0 ? regularPartners : partners).map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

function LoadingState() {
  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading partners…</p>
      </CardContent>
    </Card>
  )
}

function EmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <Card className="border-border">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Building2 className="mb-4 h-10 w-10 text-muted-foreground" />
        <p className="text-center text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  )
}
