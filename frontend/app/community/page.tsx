"use client"

import { Suspense, useState, useMemo, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getImageDisplayUrl } from "@/lib/stored-image"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Mail, 
  X, 
  Users, 
  Star,
  UserPlus,
  CheckCircle2,
  Heart,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { badgeClassForLabel } from "@/lib/badge-styles"
import { FilterChip } from "@/components/mobile/filter-chip"
import { FilterChipRow } from "@/components/mobile/filter-chip-row"
import { MobileSearchBar } from "@/components/mobile/mobile-search-bar"
import { MobileFilterSheet } from "@/components/mobile/mobile-filter-sheet"
import { UnderlineTabs } from "@/components/mobile/underline-tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCommunityMembers } from "@/lib/hooks/use-community"
import { CommunityMember } from "@/types/community"

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
  const industries = ["All"] // TODO: Add when industry field is added to schema
  const roles = ["All"] // TODO: Add when role field is added to schema

  const filteredAndSortedMembers = members // Already filtered and sorted by API

  const featuredMembers = useMemo(() => {
    return members.filter(m => m.featured)
  }, [members])

  const hasActiveFilters = selectedIndustry !== "All" || selectedRole !== "All" || selectedExperience !== "All" || selectedAvailability !== "All" || selectedLocation !== "All" || selectedSkills.length > 0 || sortBy !== "newest" || showFeatured

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

  const badgeFor = (label: string) => badgeClassForLabel(label)

  const advancedFilterCount = [
    selectedExperience !== "All",
    selectedAvailability !== "All",
    selectedLocation !== "All",
    sortBy !== "newest",
  ].filter(Boolean).length

  return (
    <DashboardLayout>
      <div className="space-y-5 md:space-y-10">
        <div className="hidden md:block">
          <Breadcrumbs items={[{ label: "Community" }]} />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Community</h1>
          <p className="hidden text-sm text-muted-foreground sm:block md:text-base max-w-2xl">
            Connect with social entrepreneurs, innovators, and changemakers building sustainable solutions.
          </p>
        </div>

        {/* Stats — horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
          {[
            { label: "Members", value: pagination?.total ?? 0, icon: Users },
            { label: "Featured", value: featuredMembers.length, icon: Star },
            { label: "Connections", value: myConnections.length, icon: UserPlus },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex min-w-[7.5rem] shrink-0 flex-col rounded-xl border border-border/60 bg-muted/20 px-4 py-3"
            >
              <stat.icon className="mb-1 h-3.5 w-3.5 text-primary/70" />
              <span className="text-xl font-semibold tabular-nums leading-none">
                {isLoading ? "—" : stat.value}
              </span>
              <span className="mt-1 text-[11px] text-muted-foreground">{stat.label}</span>
            </div>
          ))}
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

        <UnderlineTabs
          className="md:hidden"
          items={[
            { value: "all", label: "All members" },
            { value: "connections", label: `Connections (${myConnections.length})` },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden w-full max-w-md grid-cols-2 md:grid">
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="connections">My Connections ({myConnections.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4 md:space-y-6 md:mt-6 transition-opacity duration-200 ease-in-out" style={{ opacity: isFiltering ? 0.6 : 1 }}>
            {/* Featured — compact on mobile */}
            {!hasActiveFilters && featuredMembers.length > 0 && (
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary md:h-5 md:w-5" />
                  <h2 className="text-lg font-semibold md:text-2xl">Featured</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-4">
                  {featuredMembers.map((member) => (
                    <Link key={member.id} href={`/community/${member.id}`} className="block w-[11rem] shrink-0 md:w-auto">
                      <Card className="flex h-full cursor-pointer flex-col transition-all hover:border-primary/50 border-border ring-1 ring-primary/10">
                        <CardHeader className="p-4 text-center">
                          <Avatar className="mx-auto h-14 w-14 md:h-20 md:w-20">
                            {getImageDisplayUrl(member.avatar || member.image) ? (
                              <AvatarImage
                                src={getImageDisplayUrl(member.avatar || member.image)}
                                alt={member.name || "Member"}
                              />
                            ) : null}
                            <AvatarFallback>{(member.name || "?").charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5 mt-2">
                            <CardTitle className="text-sm md:text-lg line-clamp-1">{member.name}</CardTitle>
                            <p className="text-xs text-muted-foreground line-clamp-1">{member.role}</p>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile filters */}
            <div className="space-y-3 md:hidden">
              <div className="flex gap-2">
                <MobileSearchBar
                  className="flex-1"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search members…"
                />
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
                {!hasActiveFilters && featuredMembers.length > 0 && (
                  <div className="pt-4 border-t">
                    <h2 className="text-xl md:text-2xl font-semibold mb-4">All Members</h2>
                  </div>
                )}
                <div className="space-y-2 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-4">
                  {filteredAndSortedMembers.map((member) => {
                    const isConnected = myConnections.includes(member.id)
                    return (
                      <Link key={member.id} href={`/community/${member.id}`}>
                        <Card className="flex cursor-pointer flex-row items-center gap-3 border-border/80 p-3 transition-colors hover:border-primary/40 hover:bg-muted/20 md:flex-col md:p-0 md:text-center">
                          <Avatar className="h-12 w-12 shrink-0 md:mx-auto md:mt-4 md:h-20 md:w-20">
                            {(member.avatar || member.image) ? (
                              <AvatarImage
                                src={member.avatar || member.image}
                                alt={member.name}
                              />
                            ) : null}
                            <AvatarFallback>{member.name?.charAt(0) || "?"}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1 md:w-full">
                            <div className="md:px-4 md:pb-2">
                              {member.featured && (
                                <Badge className="mb-1 hidden bg-primary/10 text-primary border-primary/20 md:inline-flex">
                                  <Star className="mr-1 h-3 w-3" />
                                  Featured
                                </Badge>
                              )}
                              <CardTitle className="truncate text-base md:text-lg">{member.name || "Anonymous"}</CardTitle>
                              {member.role && (
                                <p className="truncate text-sm text-muted-foreground">{member.role}</p>
                              )}
                              {member.industry && (
                                <p className="hidden truncate text-xs text-muted-foreground md:block">{member.industry}</p>
                              )}
                            </div>
                            <CardContent className="hidden flex-1 space-y-3 p-4 pt-0 text-center md:block">
                              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{member.connections || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{member.followers || 0}</span>
                                </div>
                              </div>
                              {member.experienceLevel && (
                                <Badge className={`${badgeFor(member.experienceLevel)} text-xs`} variant="outline">
                                  {member.experienceLevel}
                                </Badge>
                              )}
                              {isConnected && (
                                <Badge variant="default" className="text-xs">
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                  Connected
                                </Badge>
                              )}
                            </CardContent>
                          </div>
                          <div className="shrink-0 md:hidden">
                            {isConnected ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : (
                              <UserPlus className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <CardFooter className="hidden w-full grid-cols-2 gap-2 border-t p-4 md:grid">
                            {member.email && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full gap-2"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  window.location.href = `mailto:${member.email}`
                                }}
                              >
                                <Mail className="h-4 w-4" />
                                Email
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full gap-2"
                              onClick={async (e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                try {
                                  const response = await fetch("/api/connections", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      toUserId: member.id,
                                    }),
                                  })
                                  if (response.ok) {
                                    // Refresh page or update state
                                    window.location.reload()
                                  }
                                } catch (error) {
                                  console.error("Failed to send connection request:", error)
                                }
                              }}
                            >
                              <UserPlus className="h-4 w-4" />
                              {isConnected ? "Connected" : "Connect"}
                            </Button>
                          </CardFooter>
                        </Card>
                      </Link>
                    )
                  })}
                </div>

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

          <TabsContent value="connections" className="space-y-6 mt-6 transition-opacity duration-200 ease-in-out" style={{ opacity: isFiltering ? 0.6 : 1 }}>
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {filteredAndSortedMembers.map((member) => (
                  <Link key={member.id} href={`/community/${member.id}`}>
                    <Card className="flex flex-col cursor-pointer transition-all hover:bg-muted/30 hover:border-primary/50 border-border h-full">
                      <CardHeader className="text-center">
                            <Avatar className="mx-auto h-20 w-20">
                              {getImageDisplayUrl(member.avatar || member.image) ? (
                                <AvatarImage
                                  src={getImageDisplayUrl(member.avatar || member.image)}
                                  alt={member.name || "Member"}
                                />
                              ) : null}
                              <AvatarFallback>{(member.name || "?").charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          <div className="space-y-1 mt-3">
                            <CardTitle className="text-lg">{member.name || "Anonymous"}</CardTitle>
                            {member.role && (
                              <p className="text-sm font-medium text-muted-foreground">{member.role}</p>
                            )}
                            {member.industry && (
                              <p className="text-xs text-muted-foreground">{member.industry}</p>
                            )}
                          </div>
                      </CardHeader>
                      <CardContent className="flex-1 text-center space-y-3">
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{member.connections}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{member.followers}</span>
                          </div>
                        </div>
                        <Badge variant="default" className="text-xs">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Connected
                        </Badge>
                      </CardContent>
                      <CardFooter className="grid grid-cols-2 gap-2 border-t pt-4">
                        {member.email && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full gap-2"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              window.location.href = `mailto:${member.email}`
                            }}
                          >
                            <Mail className="h-4 w-4" />
                            Email
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full gap-2"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            // Already connected, show profile
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          View
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
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
