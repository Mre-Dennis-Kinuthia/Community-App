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

const categoryColors: Record<string, string> = {
  "Climate & Environment": "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  "Agriculture": "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "Circular Economy": "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
  "Healthcare": "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  "FinTech": "bg-chart-2/20 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2/80",
  "Water & Sanitation": "bg-chart-2/20 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2/80",
}

const stageColors: Record<string, string> = {
  "Early Stage": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  "Growth": "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/80",
  "Scaling": "bg-chart-3/20 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3/80",
}

const needsColors: Record<string, string> = {
  "Seeking Funding": "bg-chart-5/20 text-chart-5 dark:bg-chart-5/20 dark:text-chart-5/80",
  "Seeking Collaborators": "bg-chart-2/20 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2/80",
  "Looking for Volunteers": "bg-chart-4/20 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4/80",
  "Open to Partnerships": "bg-chart-3/20 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3/80",
}

const needsIcons: Record<string, any> = {
  "Seeking Funding": DollarSign,
  "Seeking Collaborators": UserPlus,
  "Looking for Volunteers": Users,
  "Open to Partnerships": Handshake,
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
  
  const projectsParams = new URLSearchParams()
  if (searchQuery) projectsParams.set("search", searchQuery)
  if (categoryFilter !== "all") projectsParams.set("category", categoryFilter)
  if (stageFilter !== "all") projectsParams.set("stage", stageFilter)
  if (locationFilter !== "all") projectsParams.set("location", locationFilter)
  if (showFeatured) projectsParams.set("featured", "true")
  const projectsKey = `/api/projects?${projectsParams.toString()}`
  const { data: projectsResponse, error: projectsError, isLoading: isLoadingProjects } = useSWR<{ projects?: any[] }>(projectsKey)
  const projectsData = projectsResponse?.projects ?? []
  const projectsErrorMsg = projectsError?.message ?? null

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
        project.founder?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <Breadcrumbs items={[{ label: "Projects & Initiatives" }]} />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Projects & Initiatives</h1>
          <p className="text-muted-foreground text-base">
            Discover member projects creating positive social and environmental impact across Kenya and beyond.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card ">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{projectsData.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card ">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Featured</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {projectsData.filter((p) => p.isFeatured).length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card ">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Seeking Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {projectsData.filter((p) => p.needs && p.needs.length > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card ">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Followers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {projectsData.reduce((sum, p) => sum + (p._count?.followers || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Projects Section */}
        {!hasActiveFilters && featuredProjects.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">Featured Projects</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className={`border-border/50 shadow-card transition-all hover:shadow-card hover:border-primary/50 cursor-pointer h-full ring-2 ring-primary/20`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              <Star className="mr-1 h-3 w-3" />
                              Featured
                            </Badge>
                            <Badge className={categoryColors[project.category]}>
                              {project.category}
                            </Badge>
                            <Badge className={stageColors[project.stage]}>
                              {project.stage}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={project.founderAvatar} alt={project.founder} />
                              <AvatarFallback>{(project.founder ?? "?")[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">by {project.founder}</span>
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
                      {project.needs.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.needs.slice(0, 2).map((need, idx) => {
                            const NeedIcon = needsIcons[need] || Users
                            return (
                              <Badge key={idx} className={needsColors[need]} variant="outline">
                                <NeedIcon className="mr-1 h-3 w-3" />
                                {need}
                              </Badge>
                            )
                          })}
                          {project.needs.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.needs.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{project.followers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{project.volunteers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{project.location}</span>
                        </div>
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

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects, founders, impact areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 shadow-sm"
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
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="impactful">Most Impactful</SelectItem>
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px] shadow-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full md:w-[180px] shadow-sm">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {uniqueStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={needsFilter} onValueChange={setNeedsFilter}>
              <SelectTrigger className="w-full md:w-[180px] shadow-sm">
                <SelectValue placeholder="All Needs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Needs</SelectItem>
                {uniqueNeeds.map((need) => (
                  <SelectItem key={need} value={need}>{need}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-[180px] shadow-sm">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoadingProjects ? (
          <Card className="border-border/50 shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground text-center">Loading projects...</p>
            </CardContent>
          </Card>
        ) : projectsErrorMsg ? (
          <Card className="border-border/50 shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">{projectsErrorMsg}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : filteredAndSortedProjects.length === 0 ? (
          <Card className="border-border/50 shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No projects found matching your filters.
              </p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {!hasActiveFilters && featuredProjects.length > 0 && (
              <div className="pt-4 border-t">
                <h2 className="text-2xl font-semibold mb-4">All Projects</h2>
              </div>
            )}
            <div className="grid gap-6 md:grid-cols-2">
              {filteredAndSortedProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className={`border-border/50 shadow-card transition-all hover:shadow-card hover:border-primary/50 cursor-pointer h-full ${
                    project.isFeatured ? "ring-2 ring-primary/20" : ""
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {project.isFeatured && (
                              <Badge className="bg-primary/10 text-primary border-primary/20">
                                <Star className="mr-1 h-3 w-3" />
                                Featured
                              </Badge>
                            )}
                            <Badge className={categoryColors[project.category]}>
                              {project.category}
                            </Badge>
                            <Badge className={stageColors[project.stage]}>
                              {project.stage}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={project.founderAvatar} alt={project.founder} />
                              <AvatarFallback>{(project.founder ?? "?")[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">by {project.founder}</span>
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
                        <p className="text-sm text-muted-foreground">{project.impact}</p>
                      </div>
                      {project.needs.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Looking For:</p>
                          <div className="flex flex-wrap gap-1">
                            {project.needs.slice(0, 2).map((need, idx) => {
                              const NeedIcon = needsIcons[need] || Users
                              return (
                                <Badge key={idx} className={needsColors[need]} variant="outline">
                                  <NeedIcon className="mr-1 h-3 w-3" />
                                  {need}
                                </Badge>
                              )
                            })}
                            {project.needs.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.needs.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{project._count?.followers || 0} followers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{project._count?.volunteers || 0} volunteers</span>
                        </div>
                      </div>
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
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
