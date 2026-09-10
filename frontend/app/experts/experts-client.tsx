"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { GraduationCap, Plus, Sparkles, Users, CalendarDays } from "lucide-react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Button } from "@/components/ui/button"
import { MetricCard, MetricCardGrid } from "@/components/design/metric-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { ExpertCard } from "@/components/experts/expert-card"
import type { ExpertsListResponse } from "@/types/expert"

type LinkedExpertResponse = {
  expert: { id: string; slug: string; name: string; isPublished: boolean } | null
}

export default function ExpertsPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [expertiseFilter, setExpertiseFilter] = useState(searchParams.get("expertise") || "all")
  const [initiativeFilter, setInitiativeFilter] = useState(searchParams.get("initiative") || "all")
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const params = new URLSearchParams()
  if (searchQuery.trim()) params.set("search", searchQuery.trim())
  if (expertiseFilter !== "all") params.set("expertise", expertiseFilter)
  if (initiativeFilter !== "all") params.set("initiative", initiativeFilter)

  const { data, error, isLoading } = useSWR<ExpertsListResponse>(
    `/api/experts?${params.toString()}`,
    async (url) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to load experts")
      return res.json()
    }
  )
  const { data: me } = useSWR<LinkedExpertResponse>("/api/experts/me", async (url) => {
    const res = await fetch(url)
    if (!res.ok) return { expert: null }
    return res.json()
  })

  const experts = data?.experts ?? []
  const filters = data?.filters ?? { expertise: [], initiatives: [] }
  const featuredExperts = experts.filter((expert) => expert.isFeatured)
  const regularExperts = experts.filter((expert) => !expert.isFeatured)
  const upcomingSessions = experts.reduce((sum, expert) => sum + expert.eventsCount, 0)

  useEffect(() => {
    const next = new URLSearchParams()
    if (searchQuery.trim()) next.set("search", searchQuery.trim())
    if (expertiseFilter !== "all") next.set("expertise", expertiseFilter)
    if (initiativeFilter !== "all") next.set("initiative", initiativeFilter)
    const newUrl = next.toString() ? `?${next.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, expertiseFilter, initiativeFilter, router])

  const clearFilters = () => {
    setExpertiseFilter("all")
    setInitiativeFilter("all")
    setSearchQuery("")
    router.replace(window.location.pathname, { scroll: false })
  }

  const hasActiveFilters =
    expertiseFilter !== "all" || initiativeFilter !== "all" || searchQuery.trim().length > 0
  const activeFilterCount = [
    expertiseFilter !== "all",
    initiativeFilter !== "all",
    searchQuery.trim().length > 0,
  ].filter(Boolean).length

  return (
    <DashboardLayout>
      <ListPageShell
        breadcrumb="Experts in Residence"
        title="Experts in Residence"
        description="Impact Hub Nairobi consultants supporting members across programmes, ventures, and community initiatives."
        stats={[
          { label: "Experts", value: experts.length, icon: GraduationCap },
          { label: "Focus areas", value: filters.expertise.length, icon: Users },
          { label: "Sessions", value: upcomingSessions, icon: CalendarDays },
        ]}
        statsLoading={isLoading}
        metrics={
          <MetricCardGrid compact className="grid-cols-3 sm:grid-cols-3 xl:grid-cols-3">
            <MetricCard compact label="Experts" value={experts.length} icon={GraduationCap} />
            <MetricCard compact label="Focus areas" value={filters.expertise.length} icon={Users} />
            <MetricCard compact label="Sessions" value={upcomingSessions} icon={CalendarDays} />
          </MetricCardGrid>
        }
        resultCount={experts.length}
        resultLabel="experts"
        filterCount={activeFilterCount}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        actions={
          me?.expert?.isPublished ? (
            <Button asChild size="sm" className="h-9 shrink-0 text-sm md:h-10">
              <Link href="/experts/events/new">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Host a session
              </Link>
            </Button>
          ) : null
        }
        mobileFilters={
          <MobileSearchFilterRow
            search={
              <MobileSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search experts…"
              />
            }
            filterTrigger={
              <MobileFilterSheet
                open={filterSheetOpen}
                onOpenChange={setFilterSheetOpen}
                activeCount={activeFilterCount}
                onClear={clearFilters}
              >
                <div className="space-y-4">
                  <ListPageFilterSection label="Expertise">
                    <FilterChipRow>
                      <FilterChip
                        label="All"
                        active={expertiseFilter === "all"}
                        onClick={() => setExpertiseFilter("all")}
                      />
                      {filters.expertise.map((tag) => (
                        <FilterChip
                          key={tag}
                          label={tag}
                          active={expertiseFilter === tag}
                          onClick={() => setExpertiseFilter(tag)}
                        />
                      ))}
                    </FilterChipRow>
                  </ListPageFilterSection>
                  <ListPageFilterSection label="Initiatives">
                    <FilterChipRow>
                      <FilterChip
                        label="All"
                        active={initiativeFilter === "all"}
                        onClick={() => setInitiativeFilter("all")}
                      />
                      {filters.initiatives.map((tag) => (
                        <FilterChip
                          key={tag}
                          label={tag}
                          active={initiativeFilter === tag}
                          onClick={() => setInitiativeFilter(tag)}
                        />
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
                placeholder="Search by name, bio, or focus…"
              />
            </FilterBarItem>
            <FilterBarItem>
              <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="Expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All expertise</SelectItem>
                  {filters.expertise.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterBarItem>
            <FilterBarItem>
              <Select value={initiativeFilter} onValueChange={setInitiativeFilter}>
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="Initiative" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All initiatives</SelectItem>
                  {filters.initiatives.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
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
          loadingMessage="Loading experts…"
          error={error?.message ?? null}
          errorAction={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
          isEmpty={experts.length === 0}
          empty={
            <EmptyState
              icon={GraduationCap}
              title="No experts match your filters"
              description="Try clearing filters or broadening your search."
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          }
        >
          <div className="space-y-5">
            {featuredExperts.length > 0 ? (
              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <h2 className="section-label">Featured experts</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredExperts.map((expert) => (
                    <ExpertCard key={expert.id} expert={expert} />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-2">
              {featuredExperts.length > 0 ? (
                <h2 className="section-label">All experts</h2>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(featuredExperts.length > 0 ? regularExperts : experts).map((expert) => (
                  <ExpertCard key={expert.id} expert={expert} />
                ))}
              </div>
            </section>
          </div>
        </ListPageBody>
      </ListPageShell>
    </DashboardLayout>
  )
}
