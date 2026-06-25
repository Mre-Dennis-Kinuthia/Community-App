"use client"

import { useState, useMemo, useEffect, useRef, Suspense } from "react"
import useSWR from "swr"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Breadcrumbs } from "@/components/breadcrumbs"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { OPPORTUNITY_STATUS_LABELS } from "@/lib/community-opportunity"
import { OpportunityPreviewCard } from "@/components/opportunities/opportunity-preview-card"
import { FilterChip } from "@/components/mobile/filter-chip"
import { FilterChipRow } from "@/components/mobile/filter-chip-row"
import { MobileSearchBar } from "@/components/mobile/mobile-search-bar"
import { MobileFilterSheet } from "@/components/mobile/mobile-filter-sheet"
import { PillTabs } from "@/components/mobile/pill-tabs"
import {
  MobilePageHeader,
  MobileFilterMeta,
  MobileBreadcrumbsHidden,
  MobileSearchFilterRow,
} from "@/components/mobile/mobile-page-shell"

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

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl w-full space-y-4 overflow-x-hidden md:space-y-6">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs items={[{ label: "Programs & Resources" }]} />
        </MobileBreadcrumbsHidden>

        <MobilePageHeader
          title="Programs & Resources"
          description="Scouted funding, programs, and roles — plus tools and guides for your impact journey."
        />

        <PillTabs
          items={[
            { value: "programs", label: "Opportunities" },
            { value: "resources", label: "Resources" },
          ]}
          value={activeTab}
          onChange={(v) => handleTabChange(v as "programs" | "resources")}
        />

        {/* Mobile filters */}
        <div className="space-y-3 md:hidden">
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
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tag</p>
                        <FilterChipRow>
                          <FilterChip label="All" active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")} />
                          {uniqueOpportunityTags.map((c) => (
                            <FilterChip key={c} label={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
                          ))}
                        </FilterChipRow>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
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
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</p>
                        <FilterChipRow>
                          <FilterChip label="All" active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")} />
                          {resourceCategoryNames.map((c) => (
                            <FilterChip key={c} label={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
                          ))}
                        </FilterChipRow>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</p>
                        <FilterChipRow>
                          <FilterChip label="All" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
                          {uniqueResourceTypes.map((t) => (
                            <FilterChip key={t} label={t} active={typeFilter === t.toLowerCase()} onClick={() => setTypeFilter(t.toLowerCase())} />
                          ))}
                        </FilterChipRow>
                      </div>
                    </>
                  )}
                </div>
              </MobileFilterSheet>
            }
          />
          <MobileFilterMeta
            count={activeTab === "programs" ? filteredOpportunities.length : filteredResources.length}
            countLabel={activeTab === "programs" ? "opportunities" : "resources"}
            filterCount={activeFilterCount}
            hasFilters={!!hasActiveFilters}
            onClear={clearFilters}
          />
        </div>

        {/* Desktop search & filters */}
        <Card className="hidden border-border md:block w-full overflow-x-hidden">
          <CardContent className="pt-4 w-full">
            <div className="space-y-3 w-full min-w-0">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={activeTab === "programs"
                    ? "Search opportunities, tags, sources…"
                    : "Search resources, templates, guides…"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 shadow-sm"
                />
              </div>

              {/* Filters */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 w-full min-w-0">
                {activeTab === "programs" ? (
                  <>
                    <div className="min-w-0">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="shadow-sm w-full">
                          <SelectValue placeholder="All tags" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All tags</SelectItem>
                          {uniqueOpportunityTags.map((tag) => (
                            <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="min-w-0">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="shadow-sm w-full">
                          <SelectValue placeholder="All status" />
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
                    </div>
                    {hasActiveFilters ? (
                      <div className="min-w-0">
                        <Button variant="outline" size="sm" onClick={clearFilters} className="shadow-sm w-full">
                          <X className="mr-2 h-4 w-4" />
                          Clear
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="hidden lg:block min-w-0" />
                        <div className="hidden lg:block min-w-0" />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="min-w-0">
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="shadow-sm w-full">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {resourceCategoryNames.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="min-w-0">
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="shadow-sm w-full">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {uniqueResourceTypes.map((type) => (
                            <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {hasActiveFilters ? (
                      <div className="min-w-0">
                        <Button variant="outline" size="sm" onClick={clearFilters} className="shadow-sm w-full">
                          <X className="mr-2 h-4 w-4" />
                          Clear
                        </Button>
                      </div>
                    ) : (
                      <div className="hidden lg:block min-w-0" />
                    )}
                    {/* Placeholder to maintain grid layout */}
                    <div className="hidden lg:block min-w-0" />
                  </>
                )}
              </div>

              {/* Filter Summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary">
                      {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} applied
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {activeTab === "programs"
                      ? `${filteredOpportunities.length} opportunit${filteredOpportunities.length !== 1 ? "ies" : "y"} found`
                      : `${filteredResources.length} resource${filteredResources.length !== 1 ? "s" : ""} found`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opportunities Tab */}
        <div
          className="space-y-6 w-full overflow-x-hidden"
          style={{ display: activeTab === "programs" ? "block" : "none" }}
          aria-hidden={activeTab !== "programs"}
        >
            {isLoadingOpportunities ? (
              <Card className="border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground text-center">Loading opportunities…</p>
                </CardContent>
              </Card>
            ) : opportunitiesErrorMsg ? (
              <Card className="border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">{opportunitiesErrorMsg}</p>
                </CardContent>
              </Card>
            ) : filteredOpportunities.length === 0 ? (
              <Card className="border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No opportunities match your filters yet. Check back soon — our team scouts new
                    programs regularly.
                  </p>
                  {hasActiveFilters ? (
                    <Button variant="outline" onClick={clearFilters} className="mt-4">
                      Clear filters
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
              <div className="grid w-full min-w-0 grid-cols-1 items-stretch gap-3 sm:gap-4 md:grid-cols-2 md:gap-6">
                {filteredOpportunities.map((item) => (
                  <Link
                    key={item.id}
                    href={`/resources/opportunities/${item.id}`}
                    className="block h-full min-w-0 max-w-full touch-manipulation active:opacity-95"
                  >
                    <OpportunityPreviewCard item={item} className="cursor-pointer" />
                  </Link>
                ))}
              </div>
            )}
        </div>

        {/* Resources Tab */}
        <div 
          className="space-y-6 w-full overflow-x-hidden" 
          style={{ display: activeTab === "resources" ? "block" : "none" }}
          aria-hidden={activeTab !== "resources"}
        >
            {isLoadingResources ? (
              <Card className="border-border ">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground text-center">Loading resources...</p>
                </CardContent>
              </Card>
            ) : resourcesErrorMsg ? (
              <Card className="border-border ">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">{resourcesErrorMsg}</p>
                  <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : filteredResources.length === 0 ? (
              <Card className="border-border ">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No resources found matching your filters.
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-3 w-full min-w-0">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="flex flex-col border-border ">
                    <CardHeader>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      {resource.description && (
                        <CardDescription className="text-sm">{resource.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${typeColors[resource.type] || ""}`}>
                          {resource.type}
                        </span>
                        {resource.category && (
                          <>
                            <span>•</span>
                            <span>{resource.category}</span>
                          </>
                        )}
                      </div>
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        {resource.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(resource.url, "_blank")}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Link
                          </Button>
                        )}
                        {resource.fileUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              const link = document.createElement("a")
                              link.href = resource.fileUrl
                              link.download = resource.title
                              link.click()
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card className="bg-primary/5 border-border">
              <CardHeader>
                <CardTitle>Can't find what you're looking for?</CardTitle>
                <CardDescription>Suggest a resource or template for the community library.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => alert("Resource suggestion form would open here")}
                  variant="outline"
                >
                  Suggest Resource
                </Button>
              </CardContent>
            </Card>
        </div>
      </div>
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
