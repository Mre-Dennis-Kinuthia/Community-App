"use client"

import { Suspense, useState, useMemo, useEffect } from "react"
import useSWR from "swr"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Lightbulb, 
  Search, 
  X,
  Users,
  TrendingUp,
  Heart,
  Globe,
  Target,
  Calendar,
  ExternalLink,
  DollarSign,
  Handshake,
  UserPlus,
  MapPin,
  Star
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { format } from "date-fns"
import Link from "next/link"
import { Loader2 } from "lucide-react"
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
import { MetricCard, MetricCardGrid } from "@/components/design/metric-card"
import {
  DataList,
  DataListRow,
  DataListPrimary,
  DataListMeta,
} from "@/components/design/data-list"
import { EmptyState } from "@/components/design/empty-state"
import { FilterBar, FilterBarItem } from "@/components/design/filter-bar"

const categoryColors: Record<string, string> = {
  "Climate & Environment": "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  "Agriculture": "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "Circular Economy": "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
  "Healthcare": "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  "FinTech": "bg-muted text-muted-foreground border border-border",
  "Water & Sanitation": "bg-muted text-muted-foreground border border-border",
}

const stageColors: Record<string, string> = {
  "Early Stage": "bg-muted text-muted-foreground border border-border",
  "Growth": "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/80",
  "Scaling": "bg-muted text-muted-foreground border border-border",
}

const needsColors: Record<string, string> = {
  "Seeking Funding": "bg-muted text-muted-foreground border border-border",
  "Seeking Collaborators": "bg-muted text-muted-foreground border border-border",
  "Looking for Volunteers": "bg-muted text-muted-foreground border border-border",
  "Open to Partnerships": "bg-muted text-muted-foreground border border-border",
}

const needsIcons: Record<string, any> = {
  "Seeking Funding": DollarSign,
  "Seeking Collaborators": UserPlus,
  "Looking for Volunteers": Users,
  "Open to Partnerships": Handshake,
}

function founderName(project: any): string {
  if (project == null) return "Unknown"
  const f = project.founder
  if (typeof f === "string") return f || "Unknown"
  if (f && typeof f === "object" && "name" in f) return (f as { name?: string }).name ?? "Unknown"
  return "Unknown"
}

function ProjectsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get("category") || "all")
  const [stageFilter, setStageFilter] = useState<string>(searchParams.get("stage") || "all")
  const [needsFilter, setNeedsFilter] = useState<string>(searchParams.get("needs") || "all")
  const [locationFilter, setLocationFilter] = useState<string>(searchParams.get("location") || "all")
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "newest")
  const [showFeatured, setShowFeatured] = useState<boolean>(searchParams.get("featured") === "true")
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  
  const projectsParams = new URLSearchParams()
  if (searchQuery) projectsParams.set("search", searchQuery)
  if (categoryFilter !== "all") projectsParams.set("category", categoryFilter)
  if (stageFilter !== "all") projectsParams.set("stage", stageFilter)
  if (locationFilter !== "all") projectsParams.set("location", locationFilter)
  if (showFeatured) projectsParams.set("featured", "true")
  const projectsKey = `/api/projects?${projectsParams.toString()}`
  const { data: projectsResponse, error: projectsError, isLoading: isLoadingProjects, mutate: mutateProjects } = useSWR<{ projects?: any[] }>(projectsKey, {
    onErrorRetry: (err, _key, _config, revalidate, { retryCount }) => {
      // Don't retry on 503 (Service Unavailable) - avoid hammering a failing service
      if (err?.status === 503 && retryCount >= 1) return
      if (retryCount >= 3) return
      setTimeout(() => revalidate({ retryCount }), 2000)
    },
  })
  const projectsData = Array.isArray(projectsResponse?.projects) ? projectsResponse.projects : []
  const projectsErrorMsg = projectsError?.message ?? null
  const isServiceUnavailable = (projectsError as { status?: number })?.status === 503

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (categoryFilter !== "all") params.set("category", categoryFilter)
    if (stageFilter !== "all") params.set("stage", stageFilter)
    if (needsFilter !== "all") params.set("needs", needsFilter)
    if (locationFilter !== "all") params.set("location", locationFilter)
    if (sortBy !== "newest") params.set("sort", sortBy)
    if (showFeatured) params.set("featured", "true")
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, categoryFilter, stageFilter, needsFilter, locationFilter, sortBy, showFeatured, router])

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projectsData.filter((project) => {
      const matchesSearch = 
        project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        founderName(project).toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = categoryFilter === "all" || project.category === categoryFilter
      const matchesStage = stageFilter === "all" || project.stage === stageFilter
      const matchesNeeds = needsFilter === "all" || project.needs?.includes(needsFilter)
      const matchesLocation = locationFilter === "all" || project.location === locationFilter
      const matchesFeatured = !showFeatured || project.isFeatured

      return matchesSearch && matchesCategory && matchesStage && matchesNeeds && matchesLocation && matchesFeatured
    })

    // Sort projects
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          const aDate = a.launchDate ? new Date(a.launchDate).getTime() : new Date(a.createdAt).getTime()
          const bDate = b.launchDate ? new Date(b.launchDate).getTime() : new Date(b.createdAt).getTime()
          return bDate - aDate
        case "oldest":
          const aDateOld = a.launchDate ? new Date(a.launchDate).getTime() : new Date(a.createdAt).getTime()
          const bDateOld = b.launchDate ? new Date(b.launchDate).getTime() : new Date(b.createdAt).getTime()
          return aDateOld - bDateOld
        case "popular":
          return (b._count?.followers || 0) - (a._count?.followers || 0)
        case "impactful":
          // Sort by total engagement (followers + volunteers)
          const aEngagement = (a._count?.followers || 0) + (a._count?.volunteers || 0)
          const bEngagement = (b._count?.followers || 0) + (b._count?.volunteers || 0)
          return bEngagement - aEngagement
        default:
          return 0
      }
    })

    return filtered
  }, [projectsData, searchQuery, categoryFilter, stageFilter, needsFilter, locationFilter, sortBy, showFeatured])

  const featuredProjects = useMemo(() => {
    return projectsData.filter((p: any) => p.isFeatured)
  }, [projectsData])

  const hasActiveFilters = categoryFilter !== "all" || stageFilter !== "all" || needsFilter !== "all" || locationFilter !== "all" || sortBy !== "newest" || showFeatured

  const clearFilters = () => {
    setCategoryFilter("all")
    setStageFilter("all")
    setNeedsFilter("all")
    setLocationFilter("all")
    setSortBy("newest")
    setShowFeatured(false)
    setSearchQuery("")
    router.replace(window.location.pathname, { scroll: false })
  }

  const activeFilterCount = [
    categoryFilter !== "all",
    stageFilter !== "all",
    needsFilter !== "all",
    locationFilter !== "all",
    sortBy !== "newest",
    showFeatured,
    searchQuery.length > 0,
  ].filter(Boolean).length

  const uniqueCategories = Array.from(new Set(projectsData.map((p) => p.category).filter(Boolean)))
  const uniqueStages = Array.from(new Set(projectsData.map((p) => p.stage).filter(Boolean)))
  const uniqueNeeds = Array.from(new Set(projectsData.flatMap((p) => p.needs || []).filter(Boolean)))
  const uniqueLocations = Array.from(new Set(projectsData.map((p) => p.location).filter(Boolean)))

  const advancedFilterCount = [
    categoryFilter !== "all",
    stageFilter !== "all",
    needsFilter !== "all",
    locationFilter !== "all",
    sortBy !== "newest",
    showFeatured,
  ].filter(Boolean).length

  return (
    <DashboardLayout>
      <div className="space-y-5 md:space-y-10">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs items={[{ label: "Projects & Initiatives" }]} />
        </MobileBreadcrumbsHidden>
        <MobilePageHeader
          title="Projects & Initiatives"
          description="Discover member projects creating positive social and environmental impact across Kenya and beyond."
        />

        <MobileStatsStrip
          loading={isLoadingProjects}
          items={[
            { label: "Projects", value: projectsData.length, icon: Lightbulb },
            { label: "Featured", value: projectsData.filter((p) => p.isFeatured).length, icon: Star },
            { label: "Seeking support", value: projectsData.filter((p) => p.needs?.length).length, icon: Handshake },
            { label: "Followers", value: projectsData.reduce((s, p) => s + (p._count?.followers || 0), 0), icon: Heart },
          ]}
        />

        {/* Stats — desktop */}
        <div className="hidden md:block">
          <MetricCardGrid>
            <MetricCard label="Total projects" value={projectsData.length} icon={Lightbulb} />
            <MetricCard
              label="Featured"
              value={projectsData.filter((p) => p.isFeatured).length}
              icon={Star}
            />
            <MetricCard
              label="Seeking support"
              value={projectsData.filter((p) => p.needs && p.needs.length > 0).length}
              icon={Handshake}
            />
            <MetricCard
              label="Total followers"
              value={projectsData.reduce((sum, p) => sum + (p._count?.followers || 0), 0)}
              icon={Heart}
            />
          </MetricCardGrid>
        </div>

        {/* Featured Projects Section */}
        {!hasActiveFilters && featuredProjects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <h2 className="text-xl md:text-2xl font-semibold">Featured Projects</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className={`border-border  transition-all hover:bg-muted/30 hover:border-primary/50 cursor-pointer h-full ring-2 ring-primary/20 overflow-hidden`}>
                    {(project.imageUrl ?? null) && (
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={project.imageUrl} alt="" className="h-full w-full object-contain object-center" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              <Star className="mr-1 h-3 w-3" />
                              Featured
                            </Badge>
                            {project.category && (
                              <Badge className={categoryColors[project.category] ?? ""}>{project.category}</Badge>
                            )}
                            {project.stage && (
                              <Badge className={stageColors[project.stage] ?? ""}>{project.stage}</Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={project.founderAvatar ?? (typeof project.founder === "object" && project.founder != null ? (project.founder as any).image : null)} alt={founderName(project)} />
                              <AvatarFallback>{(founderName(project) ?? "?")[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">by {founderName(project)}</span>
                          </div>
                          <CardDescription className="text-base line-clamp-2">
                            {project.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Impact</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{project.impact}</p>
                      </div>
                      {(project.needs ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {(project.needs ?? []).slice(0, 2).map((need: string, idx: number) => {
                            const NeedIcon = needsIcons[need] || Users
                            return (
                              <Badge key={idx} className={needsColors[need]} variant="outline">
                                <NeedIcon className="mr-1 h-3 w-3" />
                                {need}
                              </Badge>
                            )
                          })}
                          {(project.needs ?? []).length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{(project.needs ?? []).length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{project._count?.followers ?? project.followers ?? 0} followers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{project._count?.volunteers ?? project.volunteers ?? 0} volunteers</span>
                        </div>
                        {(project.location ?? null) && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{project.location}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="pt-4 border-t">
              <Button variant="outline" onClick={() => setShowFeatured(false)} className="w-full md:w-auto">
                View All Projects
              </Button>
            </div>
          </div>
        )}

        {/* Filters — mobile */}
        <div className="space-y-3 md:hidden">
          <MobileSearchFilterRow
            search={
              <MobileSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search projects…"
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
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</p>
                    <FilterChipRow>
                      <FilterChip label="All" active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")} />
                      {uniqueCategories.map((c) => (
                        <FilterChip key={c} label={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />
                      ))}
                    </FilterChipRow>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stage</p>
                    <FilterChipRow>
                      <FilterChip label="All" active={stageFilter === "all"} onClick={() => setStageFilter("all")} />
                      {uniqueStages.map((s) => (
                        <FilterChip key={s} label={s} active={stageFilter === s} onClick={() => setStageFilter(s)} />
                      ))}
                    </FilterChipRow>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Needs</p>
                    <FilterChipRow>
                      <FilterChip label="All" active={needsFilter === "all"} onClick={() => setNeedsFilter("all")} />
                      {uniqueNeeds.map((n) => (
                        <FilterChip key={n} label={n.replace("Seeking ", "").replace("Looking for ", "")} active={needsFilter === n} onClick={() => setNeedsFilter(n)} />
                      ))}
                    </FilterChipRow>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sort</p>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="popular">Popular</SelectItem>
                        <SelectItem value="impactful">Impactful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </MobileFilterSheet>
            }
          />
          <FilterChipRow>
            <FilterChip label="All" active={!hasActiveFilters} onClick={clearFilters} />
            <FilterChip label="Featured" active={showFeatured} onClick={() => setShowFeatured(!showFeatured)} />
            {uniqueCategories.slice(0, 4).map((c) => (
              <FilterChip key={c} label={c.split(" ")[0]} active={categoryFilter === c} onClick={() => setCategoryFilter(categoryFilter === c ? "all" : c)} />
            ))}
          </FilterChipRow>
          <MobileFilterMeta
            count={filteredAndSortedProjects.length}
            countLabel="projects"
            filterCount={activeFilterCount}
            hasFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        </div>

        {/* Filters — desktop */}
        <div className="hidden md:block">
          <FilterBar className="rounded-md border border-border bg-card p-4">
            <FilterBarItem className="sm:min-w-[280px] sm:flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search projects…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-8"
                />
              </div>
            </FilterBarItem>
            <FilterBarItem>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterBarItem>
            <FilterBarItem>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-36">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="impactful">Impactful</SelectItem>
                </SelectContent>
              </Select>
            </FilterBarItem>
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            ) : null}
          </FilterBar>
        </div>

        {isLoadingProjects ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading projects…
          </div>
        ) : projectsErrorMsg ? (
          <EmptyState
            title={isServiceUnavailable ? "Projects temporarily unavailable" : "Unable to load projects"}
            description={projectsErrorMsg}
            action={
              <Button variant="outline" onClick={() => mutateProjects()}>
                Retry
              </Button>
            }
          />
        ) : filteredAndSortedProjects.length === 0 ? (
          <EmptyState
            title="No projects found"
            description="Try adjusting your filters."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            {!hasActiveFilters && featuredProjects.length > 0 ? (
              <div className="hidden border-t pt-4 md:block">
                <h2 className="section-label mb-3">All projects</h2>
              </div>
            ) : null}
            <div className="grid gap-6 md:hidden">
              {filteredAndSortedProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className={`border-border transition-all hover:bg-muted/30 h-full overflow-hidden ${
                    project.isFeatured ? "ring-2 ring-primary/20" : ""
                  }`}>
                    {(project.imageUrl ?? null) && (
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={project.imageUrl} alt="" className="h-full w-full object-contain object-center" />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="hidden md:block">
              <DataList>
                {filteredAndSortedProjects.map((project) => (
                  <DataListRow key={project.id} href={`/projects/${project.id}`}>
                    <DataListPrimary
                      title={project.title}
                      subtitle={`by ${founderName(project)}`}
                    />
                    {project.category ? (
                      <DataListMeta>{project.category}</DataListMeta>
                    ) : null}
                    {project.stage ? <DataListMeta>{project.stage}</DataListMeta> : null}
                    <DataListMeta mono>
                      {project._count?.followers || 0} followers
                    </DataListMeta>
                  </DataListRow>
                ))}
              </DataList>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectsPageContent />
    </Suspense>
  )
}
