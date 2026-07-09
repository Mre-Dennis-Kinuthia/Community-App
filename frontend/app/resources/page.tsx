"use client"

import { useState, useMemo, useEffect, useRef, Suspense } from "react"
import useSWR from "swr"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileText, 
  Download, 
  ExternalLink, 
  BookOpen, 
  Lightbulb, 
  Scale, 
  Search, 
  X,
  Users,
  Target,
  GraduationCap,
  Rocket,
  Briefcase,
  TrendingUp,
  DollarSign,
  Zap,
  FileSpreadsheet,
  Link as LinkIcon,
  PlayCircle,
} from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { OPPORTUNITY_STATUS_LABELS } from "@/lib/community-opportunity"
import { OpportunityPreviewCard } from "@/components/opportunities/opportunity-preview-card"
import { FilterChip } from "@/components/mobile/filter-chip"
import { FilterChipRow } from "@/components/mobile/filter-chip-row"
import { MobileSearchBar } from "@/components/mobile/mobile-search-bar"
import { MobileFilterSheet } from "@/components/mobile/mobile-filter-sheet"
import { PillTabs } from "@/components/mobile/pill-tabs"
import { MobileSearchFilterRow } from "@/components/mobile/mobile-page-shell"
import { FilterBarItem } from "@/components/design/filter-bar"
import { EmptyState } from "@/components/design/empty-state"
import {
  ListPageBody,
  ListPageFilterSection,
  ListPageSearchField,
  ListPageShell,
} from "@/components/design/list-page-shell"
import {
  DataList,
  DataListRow,
  DataListPrimary,
  DataListMeta,
} from "@/components/design/data-list"

// Opportunities fetched from API (scouted external programs, grants, roles, etc.)
const resourceCategories: any[] = []

const typeColors: Record<string, string> = {
  PDF: "bg-primary/10 text-primary",
  DOCX: "bg-muted text-muted-foreground border border-border",
  Link: "bg-muted text-muted-foreground border border-border",
  Video: "bg-muted text-muted-foreground border border-border",
}

function ResourcesPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<"programs" | "resources">(
    (searchParams.get("tab") as "programs" | "resources") || "resources"
  )
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get("category") || "all")
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "all")
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get("type") || "all")
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  
  // Store scroll positions for each tab
  const scrollPositionsRef = useRef<{ programs: number; resources: number }>({
    programs: 0,
    resources: 0,
  })

  // Save scroll position before tab change and prevent scroll reset
  const handleTabChange = (newTab: "programs" | "resources") => {
    // Save current scroll position (window scroll) before changing anything
    scrollPositionsRef.current[activeTab] = window.scrollY || window.pageYOffset || 0
    
    // Clear filters when switching tabs
    setSearchQuery("")
    setCategoryFilter("all")
    setStatusFilter("all")
    setTypeFilter("all")
    
    // Update tab
    setActiveTab(newTab)
  }

  // Restore scroll position after tab content is rendered
  useEffect(() => {
    const savedPosition = scrollPositionsRef.current[activeTab]
    const restoreScroll = () => {
      if (savedPosition !== undefined && savedPosition > 0) {
        requestAnimationFrame(() => {
          const maxScroll = Math.max(
            document.documentElement.scrollHeight - window.innerHeight,
            0
          )
          const targetPosition = Math.min(savedPosition, Math.max(maxScroll, 0))
          if (targetPosition > 0) {
            window.scrollTo({ top: targetPosition, behavior: "instant" })
          }
        })
      }
    }
    restoreScroll()
  }, [activeTab])

  const opportunitiesParams = new URLSearchParams()
  if (searchQuery) opportunitiesParams.set("search", searchQuery)
  if (categoryFilter !== "all") opportunitiesParams.set("tag", categoryFilter)
  const opportunitiesKey =
    activeTab === "programs" ? `/api/opportunities?${opportunitiesParams.toString()}` : null
  const {
    data: opportunitiesResponse,
    error: opportunitiesError,
    isLoading: isLoadingOpportunities,
  } = useSWR<{ opportunities?: any[]; tags?: string[] }>(opportunitiesKey)
  const opportunities = Array.isArray(opportunitiesResponse?.opportunities)
    ? opportunitiesResponse.opportunities
    : []
  const opportunityTags = opportunitiesResponse?.tags ?? []
  const opportunitiesErrorMsg = opportunitiesError?.message ?? null

  const resourcesParams = new URLSearchParams()
  if (searchQuery) resourcesParams.set("search", searchQuery)
  if (typeFilter !== "all") resourcesParams.set("type", typeFilter)
  if (categoryFilter !== "all") resourcesParams.set("category", categoryFilter)
  const resourcesKey = activeTab === "resources" ? `/api/resources?${resourcesParams.toString()}` : null
  const { data: resourcesResponse, error: resourcesError, isLoading: isLoadingResources } = useSWR<{ resources?: any[] }>(resourcesKey)
  const resources = Array.isArray(resourcesResponse?.resources) ? resourcesResponse.resources : []
  const resourcesErrorMsg = resourcesError?.message ?? null

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (activeTab) params.set("tab", activeTab)
    if (searchQuery) params.set("search", searchQuery)
    if (categoryFilter !== "all") params.set("category", categoryFilter)
    if (statusFilter !== "all") params.set("status", statusFilter)
    if (typeFilter !== "all") params.set("type", typeFilter)
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [activeTab, searchQuery, categoryFilter, statusFilter, typeFilter, router])

  // Filter opportunities (tag/search via API; status client-side)
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      return matchesStatus
    })
  }, [opportunities, statusFilter])

  // Filter Resources (already filtered by API, but apply client-side filters if needed)
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch = 
        resource.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesType = typeFilter === "all" || resource.type?.toLowerCase() === typeFilter.toLowerCase()
      const matchesCategory = categoryFilter === "all" || resource.category === categoryFilter

      return matchesSearch && matchesType && matchesCategory
    })
  }, [resources, searchQuery, categoryFilter, typeFilter])

  const hasActiveFilters = 
    searchQuery || 
    categoryFilter !== "all" || 
    statusFilter !== "all" || 
    typeFilter !== "all"

  const clearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setStatusFilter("all")
    setTypeFilter("all")
    router.replace(window.location.pathname + (activeTab ? `?tab=${activeTab}` : ""), { scroll: false })
  }

  const activeFilterCount = [
    searchQuery.length > 0,
    categoryFilter !== "all",
    statusFilter !== "all",
    typeFilter !== "all",
  ].filter(Boolean).length

  const uniqueOpportunityTags = opportunityTags
  const opportunityStatuses = ["open", "closed"] as const
  const resourceCategoryNames = Array.from(new Set(resources.map((r) => r.category).filter(Boolean)))
  const uniqueResourceTypes = Array.from(new Set(resources.map((r) => r.type).filter(Boolean)))

  const advancedFilterCount = [
    categoryFilter !== "all",
    statusFilter !== "all",
    typeFilter !== "all",
  ].filter(Boolean).length

  const resultCount =
    activeTab === "programs" ? filteredOpportunities.length : filteredResources.length
  const resultLabel = activeTab === "programs" ? "opportunities" : "resources"

  return (
    <DashboardLayout>
      <ListPageShell
        breadcrumb="Programs & Resources"
        title="Programs & Resources"
        description="Scouted funding, programs, and roles — plus tools and guides for your impact journey."
        resultCount={resultCount}
        resultLabel={resultLabel}
        filterCount={activeFilterCount}
        hasActiveFilters={!!hasActiveFilters}
        onClearFilters={clearFilters}
        showDesktopFilterBadge={false}
        toolbar={
          <PillTabs
            items={[
              { value: "programs", label: "Opportunities" },
              { value: "resources", label: "Resources" },
            ]}
            value={activeTab}
            onChange={(v) => handleTabChange(v as "programs" | "resources")}
          />
        }
        mobileFilters={
          <MobileSearchFilterRow
            search={
              <MobileSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={activeTab === "programs" ? "Search opportunities…" : "Search resources…"}
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
                  {activeTab === "programs" ? (
                    <>
                      <ListPageFilterSection label="Tag">
                        <FilterChipRow>
                          <FilterChip label="All" active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")} />
                          {uniqueOpportunityTags.map((c) => (
                            <FilterChip key={c} label={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
                          ))}
                        </FilterChipRow>
                      </ListPageFilterSection>
                      <ListPageFilterSection label="Status">
                        <FilterChipRow>
                          <FilterChip label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
                          {opportunityStatuses.map((s) => (
                            <FilterChip
                              key={s}
                              label={OPPORTUNITY_STATUS_LABELS[s]}
                              active={statusFilter === s}
                              onClick={() => setStatusFilter(s)}
                            />
                          ))}
                        </FilterChipRow>
                      </ListPageFilterSection>
                    </>
                  ) : (
                    <>
                      <ListPageFilterSection label="Category">
                        <FilterChipRow>
                          <FilterChip label="All" active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")} />
                          {resourceCategoryNames.map((c) => (
                            <FilterChip key={c} label={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
                          ))}
                        </FilterChipRow>
                      </ListPageFilterSection>
                      <ListPageFilterSection label="Type">
                        <FilterChipRow>
                          <FilterChip label="All" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
                          {uniqueResourceTypes.map((t) => (
                            <FilterChip key={t} label={t} active={typeFilter === t.toLowerCase()} onClick={() => setTypeFilter(t.toLowerCase())} />
                          ))}
                        </FilterChipRow>
                      </ListPageFilterSection>
                    </>
                  )}
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
                placeholder={
                  activeTab === "programs" ? "Search opportunities…" : "Search resources…"
                }
              />
            </FilterBarItem>
            {activeTab === "programs" ? (
              <>
                <FilterBarItem>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-9 w-36">
                      <SelectValue placeholder="Tags" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All tags</SelectItem>
                      {uniqueOpportunityTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterBarItem>
                <FilterBarItem>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 w-36">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      {opportunityStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {OPPORTUNITY_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterBarItem>
              </>
            ) : (
              <>
                <FilterBarItem>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-9 w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {resourceCategoryNames.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterBarItem>
                <FilterBarItem>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-9 w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {uniqueResourceTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FilterBarItem>
              </>
            )}
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            ) : null}
          </>
        }
      >
        <p className="hidden text-xs text-muted-foreground md:block">
          {resultCount} {resultLabel}
        </p>

        {/* Opportunities Tab */}
        <div
          className="space-y-6 w-full overflow-x-hidden"
          style={{ display: activeTab === "programs" ? "block" : "none" }}
          aria-hidden={activeTab !== "programs"}
        >
            <ListPageBody
              loading={isLoadingOpportunities}
              loadingMessage="Loading opportunities…"
              error={opportunitiesErrorMsg}
              isEmpty={filteredOpportunities.length === 0}
              empty={
                <EmptyState
                  title="No opportunities found"
                  description="Check back soon — our team scouts new programs regularly."
                  action={
                    hasActiveFilters ? (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    ) : undefined
                  }
                />
              }
            >
              <div className="grid w-full min-w-0 grid-cols-1 items-stretch gap-3 sm:gap-4 md:grid-cols-2 md:gap-6">
                {filteredOpportunities.map((item) => (
                  <Link
                    key={item.id}
                    href={`/resources/opportunities/${item.id}`}
                    className="block h-full min-w-0 max-w-full overflow-hidden touch-manipulation active:opacity-95"
                  >
                    <OpportunityPreviewCard item={item} className="cursor-pointer" />
                  </Link>
                ))}
              </div>
            </ListPageBody>
        </div>

        {/* Resources Tab */}
        <div 
          className="space-y-6 w-full overflow-x-hidden" 
          style={{ display: activeTab === "resources" ? "block" : "none" }}
          aria-hidden={activeTab !== "resources"}
        >
            <ListPageBody
              loading={isLoadingResources}
              loadingMessage="Loading resources…"
              error={resourcesErrorMsg}
              errorAction={
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              }
              isEmpty={filteredResources.length === 0}
              empty={
                <EmptyState
                  title="No resources found"
                  description="Try clearing filters or check back when new guides are published."
                  action={
                    <Button variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  }
                />
              }
            >
              <>
                <div className="grid gap-4 md:hidden">
                  {filteredResources.map((resource) => (
                    <div key={resource.id} className="rounded-md border border-border bg-card p-4">
                      <p className="font-medium">{resource.title}</p>
                      {resource.description ? (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {resource.description}
                        </p>
                      ) : null}
                      <div className="mt-3 flex gap-2">
                        {resource.url ? (
                          <Button variant="outline" size="sm" onClick={() => window.open(resource.url, "_blank")}>
                            Open
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block">
                  <DataList>
                    {filteredResources.map((resource) => (
                      <DataListRow key={resource.id} showChevron={false}>
                        <DataListPrimary
                          title={resource.title}
                          subtitle={resource.description?.slice(0, 80) || undefined}
                        />
                        <DataListMeta className="capitalize">{resource.type}</DataListMeta>
                        {resource.category ? (
                          <DataListMeta>{resource.category}</DataListMeta>
                        ) : null}
                        {resource.url ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resource.url, "_blank")}
                          >
                            Open
                          </Button>
                        ) : null}
                        {resource.fileUrl ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resource.fileUrl, "_blank")}
                          >
                            Download
                          </Button>
                        ) : null}
                      </DataListRow>
                    ))}
                  </DataList>
                </div>
              </>

            <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-sm">
              <p className="font-medium">Can&apos;t find what you&apos;re looking for?</p>
              <p className="mt-1 text-muted-foreground">
                Suggest a resource or template for the community library.
              </p>
              <Button
                className="mt-3"
                variant="outline"
                size="sm"
                onClick={() => alert("Resource suggestion form would open here")}
              >
                Suggest resource
              </Button>
            </div>
            </ListPageBody>
        </div>
      </ListPageShell>
    </DashboardLayout>
  )
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="mx-auto max-w-5xl space-y-6">
          <Breadcrumbs items={[{ label: "Programs & Resources" }]} />
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Programs & Resources</h1>
            <p className="text-muted-foreground text-base">
              Explore ongoing program opportunities and access tools, templates, and guides to support your social impact journey.
            </p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <ResourcesPageContent />
    </Suspense>
  )
}
