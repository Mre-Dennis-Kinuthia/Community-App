"use client"

import { useState, useMemo, useEffect, useRef, Suspense } from "react"
import useSWR from "swr"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  CheckCircle2
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import Link from "next/link"
import { Loader2 } from "lucide-react"

// Note: Programs are currently managed as events in the system
// For now, we'll show an empty state or fetch from events API if needed
const programOpportunities: any[] = []

// Resources will be fetched from API
const resourceCategories: any[] = []

const typeColors: Record<string, string> = {
  PDF: "bg-primary/10 text-primary",
  DOCX: "bg-chart-2/20 text-chart-2",
  Link: "bg-chart-3/20 text-chart-3",
  Video: "bg-chart-5/20 text-chart-5",
}

const programTypeColors: Record<string, string> = {
  Mentorship: "bg-chart-2/20 text-chart-2",
  Incubation: "bg-chart-3/20 text-chart-3",
  Acceleration: "bg-primary/10 text-primary",
  Fellowship: "bg-chart-5/20 text-chart-5",
}

const statusColors: Record<string, string> = {
  "Open for Applications": "bg-chart-3/20 text-chart-3",
  "Applications Closed": "bg-muted text-muted-foreground",
  "Ongoing": "bg-primary/10 text-primary",
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

  // Filter Programs
  const filteredPrograms = useMemo(() => {
    return programOpportunities.filter((program) => {
      const matchesSearch = 
        program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = categoryFilter === "all" || program.category === categoryFilter
      const matchesStatus = statusFilter === "all" || program.status === statusFilter
      const matchesType = typeFilter === "all" || program.type === typeFilter

      return matchesSearch && matchesCategory && matchesStatus && matchesType
    })
  }, [searchQuery, categoryFilter, statusFilter, typeFilter])

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

  const uniqueProgramCategories = Array.from(new Set(programOpportunities.map((p) => p.category)))
  const uniqueProgramTypes = Array.from(new Set(programOpportunities.map((p) => p.type)))
  const uniqueStatuses = Array.from(new Set(programOpportunities.map((p) => p.status)))
  const resourceCategoryNames = Array.from(new Set(resources.map((r) => r.category).filter(Boolean)))
  const uniqueResourceTypes = Array.from(new Set(resources.map((r) => r.type).filter(Boolean)))

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6 w-full overflow-x-hidden">
        <Breadcrumbs items={[{ label: "Programs & Resources" }]} />
        
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Programs & Resources</h1>
          <p className="text-muted-foreground text-base">
            Explore ongoing program opportunities and access tools, templates, and guides to support your social impact journey.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as "programs" | "resources")}>
          <TabsList className="h-9 bg-muted p-1">
            <TabsTrigger value="programs" className="rounded-md px-3 py-1.5 text-sm">
              Programs
            </TabsTrigger>
            <TabsTrigger value="resources" className="rounded-md px-3 py-1.5 text-sm">
              Resources
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Filters */}
        <Card className="border-border/50 w-full overflow-x-hidden">
          <CardContent className="pt-4 w-full">
            <div className="space-y-3 w-full min-w-0">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={activeTab === "programs" 
                    ? "Search programs, benefits, eligibility..." 
                    : "Search resources, templates, guides..."}
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
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {uniqueProgramCategories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="min-w-0">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="shadow-sm w-full">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          {uniqueStatuses.map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
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
                          {uniqueProgramTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
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
                      ? `${filteredPrograms.length} program${filteredPrograms.length !== 1 ? "s" : ""} found`
                      : `${filteredResources.length} resource${filteredResources.length !== 1 ? "s" : ""} found`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Programs Tab */}
        <div 
          className="space-y-6 w-full overflow-x-hidden" 
          style={{ display: activeTab === "programs" ? "block" : "none" }}
          aria-hidden={activeTab !== "programs"}
        >
            {filteredPrograms.length === 0 ? (
              <Card className="border-border/50 shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No programs found matching your filters.
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 w-full min-w-0">
                {filteredPrograms.map((program) => (
                  <Link key={program.id} href={program.applicationLink}>
                    <Card className="border-border/50 shadow-card transition-all hover:shadow-card  cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {program.featured && (
                                <Badge className="bg-primary/10 text-primary border-primary/20">
                                  Featured
                                </Badge>
                              )}
                              <Badge className={programTypeColors[program.type]}>
                                {program.type}
                              </Badge>
                              <Badge className={statusColors[program.status]}>
                                {program.status}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl">{program.title}</CardTitle>
                            <CardDescription className="text-base line-clamp-2">
                              {program.description}
                            </CardDescription>
                          </div>
                          {program.thumbnail && (
                            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-border/50">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={program.thumbnail}
                                alt={program.title}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Key Benefits</span>
                          </div>
                          <ul className="space-y-1">
                            {program.benefits.slice(0, 3).map((benefit, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                {benefit}
                              </li>
                            ))}
                            {program.benefits.length > 3 && (
                              <li className="text-xs text-muted-foreground">
                                +{program.benefits.length - 3} more benefits
                              </li>
                            )}
                          </ul>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={program.programLeadAvatar} alt={program.programLead} />
                            <AvatarFallback>{(program.programLead ?? "?")[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">Led by {program.programLead}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {program.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="pt-2 border-t">
                          <Badge 
                            variant={program.status === "Open for Applications" ? "default" : "secondary"} 
                            className="w-full justify-center py-2"
                          >
                            {program.status === "Open for Applications" 
                              ? "Apply Now →" 
                              : program.status === "Applications Closed"
                              ? "Applications Closed"
                              : "View Details →"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
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
              <Card className="border-border/50 shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground text-center">Loading resources...</p>
                </CardContent>
              </Card>
            ) : resourcesErrorMsg ? (
              <Card className="border-border/50 shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">{resourcesErrorMsg}</p>
                  <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : filteredResources.length === 0 ? (
              <Card className="border-border/50 shadow-card">
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
                  <Card key={resource.id} className="flex flex-col border-border/50 shadow-card">
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

            <Card className="bg-primary/5 border-border/50">
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
