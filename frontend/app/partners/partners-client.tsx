"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Loader2, Sparkles, Target, TrendingUp } from "lucide-react"
import { FilterChip } from "@/components/mobile/filter-chip"
import { FilterChipRow } from "@/components/mobile/filter-chip-row"
import { MobileSearchBar } from "@/components/mobile/mobile-search-bar"
import { MobileFilterSheet } from "@/components/mobile/mobile-filter-sheet"
import { MobileSearchFilterRow } from "@/components/mobile/mobile-page-shell"
import { FilterBarItem } from "@/components/design/filter-bar"
import { EmptyState } from "@/components/design/empty-state"
import {
  ListPageBody,
  ListPageFilterSection,
  ListPageSearchField,
  ListPageShell,
} from "@/components/design/list-page-shell"
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
      <ListPageShell
        breadcrumb="Partners & Network"
        title="Partners & network"
        description="Investors, funders, and ecosystem partners supporting social innovation in Kenya and beyond."
        stats={[
          { label: "Partners", value: partners.length, icon: Building2 },
          { label: "Investors", value: countInvestorPartners(partners), icon: TrendingUp },
          { label: "Opportunities", value: sumPartnerOpportunities(partners), icon: Target },
        ]}
        statsLoading={isLoading}
        metrics={
          <div className="grid gap-4 md:grid-cols-3">
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
        }
        resultCount={partners.length}
        resultLabel="partners"
        filterCount={activeFilterCount}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        mobileFilters={
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
                  <ListPageFilterSection label="Type">
                    <FilterChipRow>
                      <FilterChip label="All" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
                      {uniqueTypes.map((t) => (
                        <FilterChip key={t} label={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
                      ))}
                    </FilterChipRow>
                  </ListPageFilterSection>
                  <ListPageFilterSection label="Category">
                    <FilterChipRow>
                      <FilterChip label="All" active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")} />
                      {uniqueCategories.map((c) => (
                        <FilterChip key={c} label={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
                      ))}
                    </FilterChipRow>
                  </ListPageFilterSection>
                  <ListPageFilterSection label="Reach">
                    <FilterChipRow>
                      <FilterChip label="All" active={locationFilter === "all"} onClick={() => setLocationFilter("all")} />
                      {uniqueLocationTypes.map((l) => (
                        <FilterChip key={l} label={l} active={locationFilter === l} onClick={() => setLocationFilter(l)} />
                      ))}
                    </FilterChipRow>
                  </ListPageFilterSection>
                </div>
              </MobileFilterSheet>
            }
          />
        }
        desktopFilters={
          <>
            <FilterBarItem className="sm:min-w-[280px] sm:flex-1">
              <ListPageSearchField
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name, description, or focus area…"
              />
            </FilterBarItem>
            <FilterBarItem>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 w-[170px]">
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
            </FilterBarItem>
            <FilterBarItem>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-[170px]">
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
            </FilterBarItem>
            <FilterBarItem>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-9 w-[150px]">
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
            </FilterBarItem>
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            ) : null}
          </>
        }
      >
        <ListPageBody
          loading={isLoading}
          loadingMessage="Loading partners…"
          error={error?.message ?? null}
          errorAction={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
          isEmpty={partners.length === 0}
          empty={
            <EmptyState
              icon={Building2}
              title="No partners match your filters"
              description="Try clearing filters or broadening your search."
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          }
        >
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
        </ListPageBody>
      </ListPageShell>
    </DashboardLayout>
  )
}
