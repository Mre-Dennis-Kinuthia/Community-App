"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowRight,
  BarChart3,
  DollarSign,
  Filter,
  LineChart,
  MapPin,
  Search,
  Shield,
  Sparkles,
  Loader2,
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { FilterChip } from "@/components/mobile/filter-chip"
import { FilterChipRow } from "@/components/mobile/filter-chip-row"
import { MobileSearchBar } from "@/components/mobile/mobile-search-bar"
import { MobileFilterSheet } from "@/components/mobile/mobile-filter-sheet"
import { PillTabs } from "@/components/mobile/pill-tabs"
import {
  MobilePageHeader,
  MobileStatsStrip,
  MobileFilterMeta,
  MobileBreadcrumbsHidden,
  MobileSearchFilterRow,
} from "@/components/mobile/mobile-page-shell"

type InvestmentProject = {
  id: string
  title: string
  category: string | null
  stage: string | null
  fundingStage: string | null
  impact: string | null
  imageUrl: string | null
  location: string | null
  investmentVisibility: string
  isInvestmentOpen: boolean
  capitalSought: number | null
  ticketMin: number | null
  ticketMax: number | null
  readinessScore: number | null
  revenueMonthly: number | null
  growthRateMonthly: number | null
  runwayMonths: number | null
  lastRoundAmount: number | null
  lastRoundDate: string | null
  founderName: string | null
  founderAvatar: string | null
  createdAt: string
}

type InvestmentsResponse = {
  isInvestor: boolean
  projects: InvestmentProject[]
  metrics: {
    activeCount: number
    totalCapitalSought: number | null
    avgReadinessScore: number | null
    sectorsCount: number
  }
}

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—"
  if (value >= 1_000_000) {
    return `KES ${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `KES ${(value / 1_000).toFixed(1)}K`
  }
  return `KES ${value.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`
}

function InvestmentsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [sectorFilter, setSectorFilter] = useState<string>(searchParams.get("sector") || "all")
  const [stageFilter, setStageFilter] = useState<string>(searchParams.get("stage") || "all")
  const [fundingStageFilter, setFundingStageFilter] = useState<string>(
    searchParams.get("fundingStage") || "all"
  )
  const [locationFilter, setLocationFilter] = useState<string>(
    searchParams.get("location") || "all"
  )
  const [visibilityFilter, setVisibilityFilter] = useState<string>(
    searchParams.get("visibility") || "all"
  )
  const [capitalMin, setCapitalMin] = useState<string>(searchParams.get("capitalMin") || "")
  const [capitalMax, setCapitalMax] = useState<string>(searchParams.get("capitalMax") || "")
  const [readinessMin, setReadinessMin] = useState<string>(
    searchParams.get("readinessMin") || ""
  )
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("q") || "")
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // Build query params for API key
  const apiParams = new URLSearchParams()
  if (sectorFilter !== "all") apiParams.set("sector", sectorFilter)
  if (stageFilter !== "all") apiParams.set("stage", stageFilter)
  if (fundingStageFilter !== "all") apiParams.set("fundingStage", fundingStageFilter)
  if (locationFilter !== "all") apiParams.set("location", locationFilter)
  if (visibilityFilter !== "all") apiParams.set("visibility", visibilityFilter)
  if (capitalMin) apiParams.set("capitalMin", capitalMin)
  if (capitalMax) apiParams.set("capitalMax", capitalMax)
  if (readinessMin) apiParams.set("readinessMin", readinessMin)

  const investmentsKey = `/api/investments?${apiParams.toString()}`

  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR<InvestmentsResponse>(investmentsKey)

  const isInvestor = !!data?.isInvestor
  const projects = data?.projects || []

  // Client-side text search on top of server-side filters
  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects
    const q = searchQuery.toLowerCase()
    return projects.filter((p) => {
      return (
        p.title.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.stage || "").toLowerCase().includes(q) ||
        (p.fundingStage || "").toLowerCase().includes(q) ||
        (p.location || "").toLowerCase().includes(q) ||
        (p.impact || "").toLowerCase().includes(q)
      )
    })
  }, [projects, searchQuery])

  const hasFilters =
    sectorFilter !== "all" ||
    stageFilter !== "all" ||
    fundingStageFilter !== "all" ||
    locationFilter !== "all" ||
    visibilityFilter !== "all" ||
    capitalMin !== "" ||
    capitalMax !== "" ||
    readinessMin !== "" ||
    searchQuery !== ""

  // Unique filter options derived from data
  const uniqueSectors = Array.from(
    new Set(projects.map((p) => p.category).filter(Boolean) as string[])
  )
  const uniqueStages = Array.from(
    new Set(projects.map((p) => p.stage).filter(Boolean) as string[])
  )
  const uniqueFundingStages = Array.from(
    new Set(projects.map((p) => p.fundingStage).filter(Boolean) as string[])
  )
  const uniqueLocations = Array.from(
    new Set(projects.map((p) => p.location).filter(Boolean) as string[])
  )

  useEffect(() => {
    const params = new URLSearchParams()
    if (sectorFilter !== "all") params.set("sector", sectorFilter)
    if (stageFilter !== "all") params.set("stage", stageFilter)
    if (fundingStageFilter !== "all") params.set("fundingStage", fundingStageFilter)
    if (locationFilter !== "all") params.set("location", locationFilter)
    if (visibilityFilter !== "all") params.set("visibility", visibilityFilter)
    if (capitalMin) params.set("capitalMin", capitalMin)
    if (capitalMax) params.set("capitalMax", capitalMax)
    if (readinessMin) params.set("readinessMin", readinessMin)
    if (searchQuery) params.set("q", searchQuery)

    const newUrl = params.toString() ? `?${params.toString()}` : "/investments"
    router.replace(newUrl, { scroll: false })
  }, [
    sectorFilter,
    stageFilter,
    fundingStageFilter,
    locationFilter,
    visibilityFilter,
    capitalMin,
    capitalMax,
    readinessMin,
    searchQuery,
    router,
  ])

  const clearFilters = () => {
    setSectorFilter("all")
    setStageFilter("all")
    setFundingStageFilter("all")
    setLocationFilter("all")
    setVisibilityFilter("all")
    setCapitalMin("")
    setCapitalMax("")
    setReadinessMin("")
    setSearchQuery("")
    router.replace("/investments", { scroll: false })
  }

  const metrics = data?.metrics

  const advancedFilterCount = [
    sectorFilter !== "all",
    stageFilter !== "all",
    fundingStageFilter !== "all",
    locationFilter !== "all",
    visibilityFilter !== "all",
    capitalMin !== "",
    capitalMax !== "",
    readinessMin !== "",
  ].filter(Boolean).length

  const activeFilterCount = advancedFilterCount + (searchQuery ? 1 : 0)

  return (
    <DashboardLayout>
      <div className="space-y-5 md:space-y-8">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs items={[{ label: "Investments & Dealflow" }]} />
        </MobileBreadcrumbsHidden>

        <MobilePageHeader
          title="Investments & Dealflow"
          description="Explore curated ventures from the Impact Hub Nairobi community that are actively raising capital."
        />

        <MobileStatsStrip
          loading={isLoading}
          items={[
            { label: "Active", value: metrics?.activeCount ?? projects.length, icon: Sparkles },
            { label: "Capital", value: isInvestor && metrics?.totalCapitalSought != null ? formatCurrency(metrics.totalCapitalSought) : "—", icon: DollarSign },
            { label: "Readiness", value: metrics?.avgReadinessScore != null ? metrics.avgReadinessScore.toFixed(1) : "—", icon: Shield },
            { label: "Sectors", value: metrics?.sectorsCount ?? uniqueSectors.length, icon: BarChart3 },
          ]}
        />

        <div className="hidden gap-4 md:grid md:grid-cols-4">
          <Card className="border-border ">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                Active opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {metrics ? metrics.activeCount : projects.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border ">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase">
                Total capital sought
              </CardTitle>
              {!isInvestor && (
                <Badge variant="outline" className="text-[10px]">
                  Investors only
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold flex items-baseline gap-1">
                {isInvestor && metrics?.totalCapitalSought != null
                  ? formatCurrency(metrics.totalCapitalSought)
                  : "—"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border ">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                <Shield className="h-3 w-3 text-primary" />
                Avg. readiness score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {metrics?.avgReadinessScore != null
                  ? metrics.avgReadinessScore.toFixed(1)
                  : "—"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border ">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                Sectors represented
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {metrics ? metrics.sectorsCount : uniqueSectors.length}
              </p>
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
                placeholder="Search ventures…"
              />
            }
            filterTrigger={
              <MobileFilterSheet
                open={filterSheetOpen}
                onOpenChange={setFilterSheetOpen}
                activeCount={advancedFilterCount}
                onClear={clearFilters}
                title="Investment filters"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sector</p>
                    <FilterChipRow>
                      <FilterChip label="All" active={sectorFilter === "all"} onClick={() => setSectorFilter("all")} />
                      {uniqueSectors.map((s) => (
                        <FilterChip key={s} label={s} active={sectorFilter === s} onClick={() => setSectorFilter(s)} />
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
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Funding stage</p>
                    <FilterChipRow>
                      <FilterChip label="All" active={fundingStageFilter === "all"} onClick={() => setFundingStageFilter("all")} />
                      {uniqueFundingStages.map((s) => (
                        <FilterChip key={s} label={s} active={fundingStageFilter === s} onClick={() => setFundingStageFilter(s)} />
                      ))}
                    </FilterChipRow>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Min capital</p>
                      <Input value={capitalMin} onChange={(e) => setCapitalMin(e.target.value)} placeholder="Min" className="h-10 rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Max capital</p>
                      <Input value={capitalMax} onChange={(e) => setCapitalMax(e.target.value)} placeholder="Max" className="h-10 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Min readiness score</p>
                    <Input value={readinessMin} onChange={(e) => setReadinessMin(e.target.value)} placeholder="0–100" className="h-10 rounded-xl" />
                  </div>
                </div>
              </MobileFilterSheet>
            }
          />
          <FilterChipRow>
            <FilterChip label="All" active={!hasFilters} onClick={clearFilters} />
            {uniqueSectors.slice(0, 4).map((s) => (
              <FilterChip key={s} label={s.split(" ")[0]} active={sectorFilter === s} onClick={() => setSectorFilter(sectorFilter === s ? "all" : s)} />
            ))}
          </FilterChipRow>
          <MobileFilterMeta
            count={filteredProjects.length}
            countLabel="ventures"
            filterCount={activeFilterCount}
            hasFilters={hasFilters}
            onClear={clearFilters}
          />
        </div>

        {/* Desktop filters */}
        <div className="hidden space-y-4 md:block">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search ventures, sectors, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 shadow-sm"
              />
            </div>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="shadow-sm">
                Clear filters
              </Button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="shadow-sm">
                <SelectValue placeholder="All sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sectors</SelectItem>
                {uniqueSectors.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="shadow-sm">
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {uniqueStages.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fundingStageFilter} onValueChange={setFundingStageFilter}>
              <SelectTrigger className="shadow-sm">
                <SelectValue placeholder="All funding stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All funding stages</SelectItem>
                {uniqueFundingStages.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="shadow-sm">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {uniqueLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="shadow-sm">
                <Filter className="h-4 w-4 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All visibility</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="investors_only">Investors only</SelectItem>
                <SelectItem value="request_access">Request access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                placeholder="Min capital (KES)"
                value={capitalMin}
                onChange={(e) => setCapitalMin(e.target.value)}
                className="shadow-sm"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="number"
                min={0}
                placeholder="Max capital (KES)"
                value={capitalMax}
                onChange={(e) => setCapitalMax(e.target.value)}
                className="shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="Min readiness score"
                value={readinessMin}
                onChange={(e) => setReadinessMin(e.target.value)}
                className="shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Dealflow grid */}
        {isLoading ? (
          <Card className="border-border ">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading investment opportunities...
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-border ">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Unable to load investments. Please try again.
              </p>
              <Button variant="outline" onClick={() => refresh()} className="mt-1">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : filteredProjects.length === 0 ? (
          <Card className="border-border ">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
              <LineChart className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center max-w-md">
                No investment opportunities match your current filters.
              </p>
              {hasFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredProjects.map((p) => {
              const isRequestAccess = p.investmentVisibility === "request_access"
              const isInvestorsOnly = p.investmentVisibility === "investors_only"
              return (
                <Link key={p.id} href={`/projects/${p.id}?mode=investment`}>
                  <Card className="border-border/60  hover:bg-muted/30-lg transition-all hover:border-primary/50 cursor-pointer h-full overflow-hidden">
                    {p.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {p.category && (
                              <Badge variant="outline" className="text-xs">
                                {p.category}
                              </Badge>
                            )}
                            {p.stage && (
                              <Badge variant="outline" className="text-xs">
                                {p.stage}
                              </Badge>
                            )}
                            {p.fundingStage && (
                              <Badge variant="secondary" className="text-[10px]">
                                {p.fundingStage.replace(/_/g, " ").toUpperCase()}
                              </Badge>
                            )}
                            {p.location && (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {p.location}
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-lg line-clamp-1">{p.title}</CardTitle>
                          {p.impact && (
                            <CardDescription className="text-sm line-clamp-2">
                              {p.impact}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={isRequestAccess ? "secondary" : "outline"}
                            className="text-[10px]"
                          >
                            {isRequestAccess
                              ? "Request access"
                              : isInvestorsOnly
                              ? "Investors only"
                              : "Public"}
                          </Badge>
                          {typeof p.readinessScore === "number" && (
                            <div className="text-right">
                              <p className="text-[11px] text-muted-foreground uppercase">
                                Readiness
                              </p>
                              <p className="text-sm font-semibold">
                                {p.readinessScore}/100
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>
                            {p.capitalSought != null
                              ? formatCurrency(p.capitalSought)
                              : "Capital TBD"}
                          </span>
                        </div>
                        {p.ticketMin != null && p.ticketMax != null && (
                          <div className="flex items-center gap-1">
                            <span>Ticket:</span>
                            <span className="font-medium">
                              {formatCurrency(p.ticketMin)} – {formatCurrency(p.ticketMax)}
                            </span>
                          </div>
                        )}
                      </div>

                      {isInvestor && (
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="space-y-1">
                            <p className="text-muted-foreground uppercase">Monthly revenue</p>
                            <p className="font-semibold">
                              {p.revenueMonthly != null
                                ? formatCurrency(p.revenueMonthly)
                                : "—"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground uppercase">Growth (m/m)</p>
                            <p className="font-semibold">
                              {p.growthRateMonthly != null
                                ? `${p.growthRateMonthly.toFixed(1)}%`
                                : "—"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground uppercase">Runway</p>
                            <p className="font-semibold">
                              {p.runwayMonths != null ? `${p.runwayMonths} months` : "—"}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={p.founderAvatar || undefined} alt={p.founderName || ""} />
                            <AvatarFallback>
                              {(p.founderName || p.title || "?").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">
                            {p.founderName ? `by ${p.founderName}` : "Community venture"}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-primary">
                          View opportunity
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function InvestmentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvestmentsPageContent />
    </Suspense>
  )
}

