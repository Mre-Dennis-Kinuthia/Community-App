"use client"

import { Suspense, useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  X, 
  Users, 
  Star,
  UserPlus,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { cn } from "@/lib/utils"
import { FilterChip } from "@/components/mobile/filter-chip"
import { FilterChipRow } from "@/components/mobile/filter-chip-row"
import { MobileFilterSheet } from "@/components/mobile/mobile-filter-sheet"
import { DirectoryMemberCard } from "@/components/community/directory-member-card"
import { DirectoryPillSearch } from "@/components/community/directory-pill-search"
import {
  getRecommendedMembers,
  RECOMMENDED_PREVIEW_LIMIT,
} from "@/lib/community-recommendations"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCommunityMembers } from "@/lib/hooks/use-community"

const experienceLevels = ["All", "Early Career", "Mid-Level", "Senior", "Expert"]
const availabilityOptions = ["All", "Open to Collaboration", "Seeking Mentorship", "Offering Mentorship", "Open to Partnerships", "Looking for Volunteers"]

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

function CommunityPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [selectedIndustry, setSelectedIndustry] = useState(searchParams.get("industry") || "All")
  const [selectedRole, setSelectedRole] = useState(searchParams.get("role") || "All")
  const [selectedExperience, setSelectedExperience] = useState(searchParams.get("experience") || "All")
  const [selectedAvailability, setSelectedAvailability] = useState(searchParams.get("availability") || "All")
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "All")
  const [selectedSkills, setSelectedSkills] = useState<string[]>(searchParams.get("skills")?.split(",").filter(Boolean) || [])
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest")
  const [showFeatured, setShowFeatured] = useState(searchParams.get("featured") === "true")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))
  const [isFiltering, setIsFiltering] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // Fetch members from API
  const {
    members,
    pagination,
    filters,
    userConnections,
    isLoading,
    error,
    refetch,
  } = useCommunityMembers({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    industry: selectedIndustry !== "All" ? selectedIndustry : undefined,
    role: selectedRole !== "All" ? selectedRole : undefined,
    experience: selectedExperience !== "All" ? selectedExperience : undefined,
    location: selectedLocation !== "All" ? selectedLocation : undefined,
    skills: selectedSkills.length > 0 ? selectedSkills : undefined,
    sort: sortBy as any,
    featured: showFeatured || undefined,
    connectionsOnly: activeTab === "connections" || undefined,
  })

  const myConnections = userConnections

  // Update URL params when filters change
  useEffect(() => {
    setIsFiltering(true)
    const params = new URLSearchParams()
    if (activeTab !== "all") params.set("tab", activeTab)
    if (debouncedSearch) params.set("search", debouncedSearch)
    if (selectedIndustry !== "All") params.set("industry", selectedIndustry)
    if (selectedRole !== "All") params.set("role", selectedRole)
    if (selectedExperience !== "All") params.set("experience", selectedExperience)
    if (selectedAvailability !== "All") params.set("availability", selectedAvailability)
    if (selectedLocation !== "All") params.set("location", selectedLocation)
    if (selectedSkills.length > 0) params.set("skills", selectedSkills.join(","))
    if (sortBy !== "newest") params.set("sort", sortBy)
    if (showFeatured) params.set("featured", "true")
    if (page > 1) params.set("page", page.toString())
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
    requestAnimationFrame(() => setIsFiltering(false))
  }, [activeTab, debouncedSearch, selectedIndustry, selectedRole, selectedExperience, selectedAvailability, selectedLocation, selectedSkills, sortBy, showFeatured, page, router])

  // Get filter options from API response
  const allUniqueSkills = filters?.skills || []
  const locations = ["All", ...(filters?.locations || [])]
  const industries = ["All", ...(filters?.industries || [])]
  const roles = ["All", ...(filters?.roles || [])]

  const filteredAndSortedMembers = members // Already filtered and sorted by API

  const hasActiveFilters = selectedIndustry !== "All" || selectedRole !== "All" || selectedExperience !== "All" || selectedAvailability !== "All" || selectedLocation !== "All" || selectedSkills.length > 0 || sortBy !== "newest" || showFeatured

  const showRecommendationSection =
    activeTab === "all" && !hasActiveFilters && !debouncedSearch

  const { members: recommendationCandidates } = useCommunityMembers({
    limit: 50,
    sort: "most_connected",
    enabled: showRecommendationSection,
  })

  const featuredMembers = useMemo(() => {
    return members.filter(m => m.featured)
  }, [members])

  const recommendationPool = useMemo(
    () => getRecommendedMembers(recommendationCandidates, myConnections),
    [recommendationCandidates, myConnections]
  )

  const recommendedPreview = useMemo(
    () => recommendationPool.slice(0, RECOMMENDED_PREVIEW_LIMIT),
    [recommendationPool]
  )

  const recommendedPreviewIds = useMemo(
    () => new Set(recommendedPreview.map((m) => m.id)),
    [recommendedPreview]
  )

  const membersForGrid = useMemo(() => {
    if (hasActiveFilters) return filteredAndSortedMembers
    return filteredAndSortedMembers.filter((m) => !recommendedPreviewIds.has(m.id))
  }, [filteredAndSortedMembers, hasActiveFilters, recommendedPreviewIds])

  const clearFilters = () => {
    setSelectedIndustry("All")
    setSelectedRole("All")
    setSelectedExperience("All")
    setSelectedAvailability("All")
    setSelectedLocation("All")
    setSelectedSkills([])
    setSortBy("newest")
    setShowFeatured(false)
    setSearchQuery("")
    router.replace(window.location.pathname, { scroll: false })
  }

  const activeFilterCount = [
    selectedIndustry !== "All",
    selectedRole !== "All",
    selectedExperience !== "All",
    selectedAvailability !== "All",
    selectedLocation !== "All",
    selectedSkills.length > 0,
    sortBy !== "newest",
    showFeatured,
    searchQuery.length > 0,
  ].filter(Boolean).length

  const advancedFilterCount = [
    selectedExperience !== "All",
    selectedAvailability !== "All",
    selectedLocation !== "All",
    sortBy !== "newest",
  ].filter(Boolean).length

  const memberGrid = (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {membersForGrid.map((member) => (
        <DirectoryMemberCard key={member.id} member={member} />
      ))}
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-5 md:space-y-8">
        <div className="hidden md:block">
          <Breadcrumbs items={[{ label: "Community" }]} />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Community Directory</h1>
            <p className="text-sm text-muted-foreground md:text-base max-w-2xl">
              Connect with social entrepreneurs, innovators, and changemakers in the hub.
            </p>
          </div>

          <div className="space-y-3 md:hidden">
            <DirectoryPillSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search members…"
            />
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "connections" ? "all" : "connections")}
              className={cn(
                "flex h-11 w-full items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors",
                activeTab === "connections"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/30 text-foreground"
              )}
            >
              <Users className="h-4 w-4" />
              My connections
              {myConnections.length > 0 ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums">
                  {myConnections.length}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <div className="hidden gap-3 md:grid md:grid-cols-4">
          <Card className="border-border  transition-all hover:bg-muted/30 hover:border-primary/40">
            <CardHeader className="py-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-primary/70" />
            </CardHeader>
            <CardContent className="pt-1 pb-3">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-semibold tracking-tight">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    pagination?.total || 0
                  )}
                </div>
                {!isLoading && (
                  <p className="text-[11px] text-muted-foreground">
                    {pagination?.total === 1 ? "member in the hub" : "members in the hub"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border  transition-all hover:bg-muted/30 hover:border-primary/40">
            <CardHeader className="py-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Featured Members
              </CardTitle>
              <Star className="h-4 w-4 text-primary/70" />
            </CardHeader>
            <CardContent className="pt-1 pb-3">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-semibold tracking-tight">
                  {featuredMembers.length}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Curated community champions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border  transition-all hover:bg-muted/30 hover:border-primary/40">
            <CardHeader className="py-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                My Connections
              </CardTitle>
              <UserPlus className="h-4 w-4 text-primary/70" />
            </CardHeader>
            <CardContent className="pt-1 pb-3">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-semibold tracking-tight">
                  {myConnections.length}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  People you&apos;re directly connected to
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border  transition-all hover:bg-muted/30 hover:border-primary/40">
            <CardHeader className="py-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Connections
              </CardTitle>
              <Users className="h-4 w-4 text-primary/70" />
            </CardHeader>
            <CardContent className="pt-1 pb-3">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-semibold tracking-tight">
                  {members.reduce((sum, m) => sum + (m.connections || 0), 0)}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Relationships across the whole community
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden w-full max-w-md grid-cols-2 md:grid">
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="connections">My Connections ({myConnections.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-2 md:space-y-6 md:mt-6 transition-opacity duration-200 ease-in-out" style={{ opacity: isFiltering ? 0.6 : 1 }}>
            {showRecommendationSection && recommendedPreview.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold md:text-lg">Recommended</h2>
                    <p className="text-xs text-muted-foreground">
                      People you may want to connect with
                    </p>
                  </div>
                  {recommendationPool.length > RECOMMENDED_PREVIEW_LIMIT ? (
                    <Link
                      href="/community/recommendations"
                      className="shrink-0 text-sm font-medium text-primary hover:underline"
                    >
                      View all ({recommendationPool.length})
                    </Link>
                  ) : null}
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
                  {recommendedPreview.map((member) => (
                    <DirectoryMemberCard key={member.id} member={member} carousel />
                  ))}
                </div>
                <div className="hidden gap-3 md:grid md:grid-cols-3 lg:grid-cols-6">
                  {recommendedPreview.map((member) => (
                    <DirectoryMemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            )}

            {/* Mobile filters — sheet only (search is in header) */}
            <div className="space-y-3 md:hidden">
              <div className="flex items-center justify-end">
                <MobileFilterSheet
                  open={filterSheetOpen}
                  onOpenChange={setFilterSheetOpen}
                  activeCount={advancedFilterCount}
                  onClear={clearFilters}
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Experience</p>
                      <FilterChipRow>
                        {experienceLevels.map((level) => (
                          <FilterChip
                            key={level}
                            label={level}
                            active={selectedExperience === level}
                            onClick={() => setSelectedExperience(level)}
                          />
                        ))}
                      </FilterChipRow>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Availability</p>
                      <FilterChipRow>
                        {availabilityOptions.map((avail) => (
                          <FilterChip
                            key={avail}
                            label={avail === "All" ? "All" : avail.replace("Open to ", "").replace("Offering ", "")}
                            active={selectedAvailability === avail}
                            onClick={() => setSelectedAvailability(avail)}
                          />
                        ))}
                      </FilterChipRow>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Location</p>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sort by</p>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="most_connected">Most Connected</SelectItem>
                          <SelectItem value="most_active">Most Active</SelectItem>
                          <SelectItem value="alphabetical">Alphabetical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </MobileFilterSheet>
              </div>

              {locations.length > 1 && (
                <FilterChipRow>
                  {locations.slice(0, 6).map((location) => (
                    <FilterChip
                      key={location}
                      label={location}
                      active={selectedLocation === location}
                      onClick={() => setSelectedLocation(location)}
                    />
                  ))}
                </FilterChipRow>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {pagination?.total ?? 0} member{(pagination?.total ?? 0) !== 1 ? "s" : ""}
                  {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount !== 1 ? "s" : ""}`}
                </span>
                {hasActiveFilters && (
                  <button type="button" onClick={clearFilters} className="font-medium text-primary">
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Desktop filters */}
            <div className="hidden space-y-4 md:block">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-10 shadow-sm"
                    placeholder="Search by name, skill, role, or interest..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="hidden md:flex">
                    {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} applied
                  </Badge>
                )}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[180px] shadow-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="most_connected">Most Connected</SelectItem>
                    <SelectItem value="most_active">Most Active</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="shadow-sm">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:flex-wrap">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-full md:w-[150px] shadow-sm">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full md:w-[150px] shadow-sm">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger className="w-full md:w-[150px] shadow-sm">
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                  <SelectTrigger className="w-full md:w-[180px] shadow-sm">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((avail) => (
                      <SelectItem key={avail} value={avail}>{avail}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full md:w-[150px] shadow-sm">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Members Grid */}
            {isLoading ? (
              <Card className="py-12">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading members...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="py-12">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <p className="text-lg font-medium text-destructive">Error loading members</p>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">{error}</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : filteredAndSortedMembers.length === 0 ? (
              <Card className="py-12">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No members found</p>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">
                    Try adjusting your search or filters to find community members
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {showRecommendationSection && recommendedPreview.length > 0 && (
                  <div className="pt-2 md:border-t md:pt-4">
                    <h2 className="mb-3 text-base font-semibold md:mb-4 md:text-lg">All members</h2>
                  </div>
                )}
                {memberGrid}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1 || isLoading}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                      disabled={page >= pagination.totalPages || isLoading}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="connections" className="space-y-4 mt-2 md:space-y-6 md:mt-6 transition-opacity duration-200 ease-in-out" style={{ opacity: isFiltering ? 0.6 : 1 }}>
            {activeTab === "connections" && (
              <p className="text-sm text-muted-foreground md:hidden">
                People you&apos;re directly connected with in the hub.
              </p>
            )}
            {isLoading ? (
              <Card className="py-12">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading connections...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="py-12">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <p className="text-lg font-medium text-destructive">Error loading connections</p>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">{error}</p>
                </CardContent>
              </Card>
            ) : filteredAndSortedMembers.length === 0 ? (
              <Card className="py-12">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No connections found</p>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">
                    Start connecting with community members to build your network
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("all")}>
                    Browse All Members
                  </Button>
                </CardContent>
              </Card>
            ) : (
              memberGrid
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommunityPageContent />
    </Suspense>
  )
}
