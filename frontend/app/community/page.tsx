"use client"

import { Suspense, useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Loader2,
  SlidersHorizontal,
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
import { MetricCard, MetricCardGrid } from "@/components/design/metric-card"
import {
  DataList,
  DataListRow,
  DataListPrimary,
  DataListMeta,
} from "@/components/design/data-list"
import { EmptyState } from "@/components/design/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { getInitials } from "@/lib/utils"

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
  const locations = ["All", ...(filters?.locations || [])]

  const filteredAndSortedMembers = members // Already filtered and sorted by API

  const hasActiveFilters = selectedIndustry !== "All" || selectedRole !== "All" || selectedExperience !== "All" || selectedAvailability !== "All" || selectedLocation !== "All" || selectedSkills.length > 0 || sortBy !== "newest" || showFeatured

  const showRecommendationSection =
    activeTab === "all" && !hasActiveFilters && !debouncedSearch

  const { members: recommendationCandidates } = useCommunityMembers({
    limit: 50,
    sort: "most_connected",
    enabled: showRecommendationSection,
  })

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

  const renderMemberList = (list: typeof members, className?: string) => (
    <div className={className}>
      <DataList>
        {list.map((member) => {
          const avatarUrl = getImageDisplayUrl(member.avatar || member.image)
          return (
            <DataListRow key={member.id} href={`/community/${member.id}`}>
              <Avatar className="h-8 w-8 shrink-0">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={member.name || "Member"} /> : null}
                <AvatarFallback className="text-xs">
                  {getInitials(member.name, member.email)}
                </AvatarFallback>
              </Avatar>
              <DataListPrimary
                title={member.name || member.email}
                subtitle={member.organization || member.role || undefined}
              />
              {member.role ? <DataListMeta>{member.role}</DataListMeta> : null}
            </DataListRow>
          )
        })}
      </DataList>
    </div>
  )

  const renderGrid = (list: typeof members, className?: string) => (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5", className)}>
      {list.map((member) => (
        <DirectoryMemberCard key={member.id} member={member} />
      ))}
    </div>
  )

  const memberGrid = renderGrid(membersForGrid)

  const filterSheet = (
    <MobileFilterSheet
      open={filterSheetOpen}
      onOpenChange={setFilterSheetOpen}
      activeCount={advancedFilterCount}
      onClear={clearFilters}
      hideTrigger
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
  )

  return (
    <DashboardLayout>
      <div className="space-y-5 md:space-y-8">
        <div className="hidden md:block">
          <Breadcrumbs items={[{ label: "Community" }]} />
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Community Directory</h1>
            <p className="hidden text-sm text-muted-foreground sm:block max-w-2xl">
              Connect with social entrepreneurs, innovators, and changemakers in the hub.
            </p>
          </div>

          <div className="flex gap-2">
            <DirectoryPillSearch
              className="flex-1"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search members…"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative h-10 w-10 shrink-0 rounded-full md:h-11 md:w-11"
              onClick={() => setFilterSheetOpen(true)}
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {advancedFilterCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {advancedFilterCount}
                </span>
              ) : null}
            </Button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex h-9 flex-1 items-center justify-center gap-2 rounded-full border text-xs font-medium transition-colors md:h-10 md:text-sm",
                activeTab === "all"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/30 text-foreground hover:bg-muted/50"
              )}
            >
              All members
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("connections")}
              className={cn(
                "flex h-9 flex-1 items-center justify-center gap-2 rounded-full border text-xs font-medium transition-colors md:h-10 md:text-sm",
                activeTab === "connections"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/30 text-foreground hover:bg-muted/50"
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

          <div className="hidden md:block">
            <MetricCardGrid className="sm:grid-cols-3">
              <MetricCard label="Members" value={pagination?.total ?? 0} icon={Users} />
              <MetricCard label="Your connections" value={myConnections.length} icon={Users} />
              <MetricCard
                label="Showing"
                value={filteredAndSortedMembers.length}
                description="On this page"
              />
            </MetricCardGrid>
          </div>

          {filterSheet}

          {activeTab === "all" && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {pagination?.total ?? 0} member{(pagination?.total ?? 0) !== 1 ? "s" : ""}
                {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount !== 1 ? "s" : ""}`}
              </span>
              {hasActiveFilters ? (
                <button type="button" onClick={clearFilters} className="font-medium text-primary">
                  Clear
                </button>
              ) : null}
            </div>
          )}
        </div>

        {activeTab === "all" ? (
          <div
            className="space-y-6 transition-opacity duration-200 ease-in-out"
            style={{ opacity: isFiltering ? 0.6 : 1 }}
          >
            {showRecommendationSection && recommendedPreview.length > 0 && (
              <div className="space-y-3 md:hidden">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold">Recommended</h2>
                  {recommendationPool.length > RECOMMENDED_PREVIEW_LIMIT ? (
                    <Link
                      href="/community/recommendations"
                      className="shrink-0 text-sm font-medium text-primary hover:underline"
                    >
                      View all
                    </Link>
                  ) : null}
                </div>
                <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {recommendedPreview.map((member) => (
                    <DirectoryMemberCard key={member.id} member={member} carousel />
                  ))}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading members…
              </div>
            ) : error ? (
              <EmptyState
                title="Error loading members"
                description={error}
                action={
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                }
              />
            ) : filteredAndSortedMembers.length === 0 ? (
              <EmptyState
                title="No members found"
                description="Try adjusting your search or filters."
                action={
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <>
                {showRecommendationSection && recommendedPreview.length > 0 && (
                  <h2 className="mb-3 text-sm font-semibold md:hidden">All members</h2>
                )}
                {renderGrid(membersForGrid, "md:hidden")}
                {renderMemberList(filteredAndSortedMembers, "hidden md:block")}

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
          </div>
        ) : (
          <div
            className="space-y-6 transition-opacity duration-200 ease-in-out"
            style={{ opacity: isFiltering ? 0.6 : 1 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading connections…
              </div>
            ) : error ? (
              <EmptyState title="Error loading connections" description={error} />
            ) : filteredAndSortedMembers.length === 0 ? (
              <EmptyState
                title="No connections found"
                description="Start connecting with community members."
                action={
                  <Button variant="outline" onClick={() => setActiveTab("all")}>
                    Browse all members
                  </Button>
                }
              />
            ) : (
              <>
                <div className="md:hidden">{memberGrid}</div>
                <div className="hidden md:block">
                  {renderMemberList(filteredAndSortedMembers)}
                </div>
              </>
            )}
          </div>
        )}
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
