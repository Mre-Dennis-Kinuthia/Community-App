"use client"

import { useState, useMemo, useEffect, useRef, Suspense } from "react"
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
  {
    id: 1,
    title: "Mentorship Program",
    type: "Mentorship",
    category: "Support",
    status: "Open for Applications",
    description: "Get matched with experienced mentors in your field. Our mentorship program connects you with industry leaders, investors, and successful entrepreneurs for one-on-one guidance.",
    benefits: [
      "One-on-one mentorship sessions",
      "Access to expert network",
      "Quarterly check-ins",
      "Goal-setting support"
    ],
    eligibility: "Open to all Impact Hub Nairobi members",
    duration: "Ongoing - 6-month cycles",
    thumbnail: "/placeholder.svg",
    programLead: "Sarah Kamau",
    programLeadAvatar: "/placeholder-user.jpg",
    featured: true,
    tags: ["Mentorship", "Networking", "Support"],
    applicationLink: "/resources/programs/1",
  },
  {
    id: 2,
    title: "Incubation Program",
    type: "Incubation",
    category: "Early Stage",
    status: "Open for Applications",
    description: "12-week intensive program for early-stage social impact startups. Provides workspace, mentorship, access to our partner network, and opportunities for seed funding.",
    benefits: [
      "12-week structured program",
      "Dedicated workspace",
      "Industry mentor matching",
      "Access to partner network",
      "Seed funding opportunities",
      "Demo day presentation"
    ],
    eligibility: "Early-stage startups (0-2 years), social impact focus",
    duration: "12 weeks per cohort",
    thumbnail: "/placeholder.svg",
    programLead: "James Mwangi",
    programLeadAvatar: "/placeholder-user.jpg",
    featured: true,
    tags: ["Incubation", "Early Stage", "Funding"],
    applicationLink: "/resources/programs/2",
  },
  {
    id: 3,
    title: "Acceleration Program",
    type: "Acceleration",
    category: "Growth",
    status: "Applications Closed",
    description: "Intensive 6-month program for ventures ready to scale. Includes advanced workshops, investor connections, and access to our global network of Impact Hubs.",
    benefits: [
      "6-month intensive program",
      "Advanced business workshops",
      "Direct investor introductions",
      "Global network access",
      "Strategic partnerships",
      "Impact measurement support"
    ],
    eligibility: "Growth-stage ventures with proven traction",
    duration: "6 months per cohort",
    thumbnail: "/placeholder.svg",
    programLead: "David Ochieng",
    programLeadAvatar: "/placeholder-user.jpg",
    featured: false,
    tags: ["Acceleration", "Scaling", "Investment"],
    applicationLink: "/resources/programs/3",
  },
  {
    id: 4,
    title: "Women in Tech Fellowship",
    type: "Fellowship",
    category: "Diversity",
    status: "Open for Applications",
    description: "Annual fellowship program supporting women entrepreneurs in technology. Provides specialized mentorship, funding opportunities, and access to tech industry networks.",
    benefits: [
      "12-month fellowship",
      "Women-focused mentorship",
      "Tech industry connections",
      "Seed funding access",
      "Community of peers",
      "Professional development"
    ],
    eligibility: "Women-led tech ventures, early to growth stage",
    duration: "12 months",
    thumbnail: "/placeholder.svg",
    programLead: "Grace Wanjiru",
    programLeadAvatar: "/placeholder-user.jpg",
    featured: true,
    tags: ["Fellowship", "Women", "Technology"],
    applicationLink: "/resources/programs/4",
  },
  {
    id: 5,
    title: "Climate Solutions Incubator",
    type: "Incubation",
    category: "Climate",
    status: "Open for Applications",
    description: "Specialized incubation program for climate and sustainability startups. Focuses on green tech, circular economy, and environmental impact solutions.",
    benefits: [
      "Climate-focused mentorship",
      "Access to climate investor network",
      "Sustainability certification support",
      "Partner connections in green sector",
      "Market validation support"
    ],
    eligibility: "Early-stage climate/sustainability ventures",
    duration: "16 weeks",
    thumbnail: "/placeholder.svg",
    programLead: "Mary Wanjala",
    programLeadAvatar: "/placeholder-user.jpg",
    featured: false,
    tags: ["Climate", "Sustainability", "Incubation"],
    applicationLink: "/resources/programs/5",
  },
]

// Resources will be fetched from API
const resourceCategories: any[] = []
  {
    id: 1,
    title: "Legal & Compliance",
    icon: Scale,
    description: "Legal templates, guides, and compliance resources",
    resources: [
      { id: 1, name: "Company Registration Guide Kenya", type: "PDF", size: "1.2 MB", popular: true, description: "Step-by-step guide for registering your company in Kenya" },
      { id: 2, name: "Standard NDA Template", type: "DOCX", size: "45 KB", new: true, description: "Non-disclosure agreement template for business partnerships" },
      { id: 3, name: "Employment Contract Template", type: "DOCX", size: "62 KB", description: "Standard employment contract template compliant with Kenyan labor laws" },
      { id: 4, name: "IP Protection Guide", type: "PDF", size: "890 KB", description: "Guide to protecting your intellectual property in Kenya" },
    ],
  },
  {
    id: 2,
    title: "Marketing & Growth",
    icon: Lightbulb,
    description: "Marketing strategies, templates, and growth tools",
    resources: [
      { id: 5, name: "Social Media Strategy Playbook 2026", type: "PDF", size: "3.5 MB", popular: true, description: "Comprehensive social media strategy guide for social enterprises" },
      { id: 6, name: "Pitch Deck Checklist", type: "PDF", size: "800 KB", popular: true, description: "Essential checklist for creating effective pitch decks" },
      { id: 7, name: "Brand Identity Guide", type: "PDF", size: "2.1 MB", description: "Guide to developing a strong brand identity for your venture" },
      { id: 8, name: "Customer Acquisition Framework", type: "PDF", size: "1.8 MB", new: true, description: "Framework for acquiring and retaining customers" },
    ],
  },
  {
    id: 3,
    title: "Business & Finance",
    icon: DollarSign,
    description: "Business planning, financial templates, and fundraising guides",
    resources: [
      { id: 9, name: "Business Model Canvas Template", type: "PDF", size: "650 KB", popular: true, description: "Printable business model canvas for planning your venture" },
      { id: 10, name: "Financial Projections Template", type: "DOCX", size: "125 KB", popular: true, description: "Excel-compatible financial projections template" },
      { id: 11, name: "Fundraising Toolkit", type: "PDF", size: "2.8 MB", description: "Complete guide to fundraising strategies and investor relations" },
      { id: 12, name: "Impact Measurement Framework", type: "PDF", size: "1.5 MB", new: true, description: "Framework for measuring and reporting social impact" },
    ],
  },
  {
    id: 4,
    title: "Tech & Product",
    icon: Zap,
    description: "Product development, tech resources, and frameworks",
    resources: [
      { id: 13, name: "Nairobi Tech Ecosystem Map", type: "Link", size: "External", new: true, description: "Interactive map of Nairobi's tech ecosystem and key players" },
      { id: 14, name: "MVP Development Framework", type: "PDF", size: "2.1 MB", popular: true, description: "Step-by-step guide to building your minimum viable product" },
      { id: 15, name: "Product Roadmap Template", type: "DOCX", size: "98 KB", description: "Template for planning your product development roadmap" },
      { id: 16, name: "Technical Due Diligence Checklist", type: "PDF", size: "1.1 MB", description: "Checklist for technical due diligence in startup acquisitions" },
    ],
  },
  {
    id: 5,
    title: "Operations & Strategy",
    icon: Briefcase,
    description: "Operational guides, processes, and strategic frameworks",
    resources: [
      { id: 17, name: "Operations Playbook", type: "PDF", size: "3.2 MB", description: "Comprehensive operations guide for scaling ventures" },
      { id: 18, name: "Hiring Guide for Startups", type: "PDF", size: "1.9 MB", popular: true, description: "Guide to building your startup team and hiring best practices" },
      { id: 19, name: "Strategic Planning Template", type: "DOCX", size: "156 KB", description: "Template for annual strategic planning sessions" },
      { id: 20, name: "Vendor Management Checklist", type: "PDF", size: "720 KB", description: "Checklist for managing vendors and suppliers effectively" },
    ],
  },
  {
    id: 6,
    title: "Impact & Measurement",
    icon: Target,
    description: "Impact measurement tools and social impact frameworks",
    resources: [
      { id: 21, name: "Theory of Change Template", type: "DOCX", size: "89 KB", popular: true, description: "Template for developing your theory of change" },
      { id: 22, name: "SDG Alignment Framework", type: "PDF", size: "2.4 MB", description: "Framework for aligning your impact with UN Sustainable Development Goals" },
      { id: 23, name: "Impact Reporting Template", type: "DOCX", size: "134 KB", description: "Template for creating impact reports for stakeholders" },
      { id: 24, name: "Stakeholder Engagement Guide", type: "PDF", size: "1.7 MB", description: "Guide to engaging stakeholders in your impact journey" },
    ],
  },
]

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
  
  // Resources state
  const [resources, setResources] = useState<any[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(true)
  const [resourcesError, setResourcesError] = useState<string | null>(null)

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
    
    // Use requestAnimationFrame to ensure DOM and layout are fully updated after display change
    const restoreScroll = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // One more frame to ensure layout is completely stable
          requestAnimationFrame(() => {
            if (savedPosition !== undefined && savedPosition > 0) {
              // Wait for layout to complete, then restore scroll position
              const maxScroll = Math.max(
                document.documentElement.scrollHeight - window.innerHeight,
                0
              )
              // Restore position, but cap it at max scrollable position to prevent errors
              const targetPosition = Math.min(savedPosition, Math.max(maxScroll, 0))
              if (targetPosition > 0) {
                window.scrollTo({ top: targetPosition, behavior: 'instant' })
              }
            }
          })
        })
      })
    }
    
    // Small delay to ensure content is rendered and layout is calculated
    const timer = setTimeout(restoreScroll, 50)
    return () => clearTimeout(timer)
  }, [activeTab])

  // Fetch resources from API
  useEffect(() => {
    async function fetchResources() {
      if (activeTab !== "resources") return
      
      try {
        setIsLoadingResources(true)
        setResourcesError(null)
        const params = new URLSearchParams()
        if (searchQuery) params.set("search", searchQuery)
        if (typeFilter !== "all") params.set("type", typeFilter)
        if (categoryFilter !== "all") params.set("category", categoryFilter)
        
        const response = await fetch(`/api/resources?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Failed to fetch resources")
        }
        const data = await response.json()
        setResources(data.resources || [])
      } catch (error: any) {
        console.error("Failed to fetch resources:", error)
        setResourcesError(error.message || "Failed to load resources")
        setResources([])
      } finally {
        setIsLoadingResources(false)
      }
    }

    fetchResources()
  }, [activeTab, searchQuery, typeFilter, categoryFilter])

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
                            <AvatarFallback>{program.programLead[0]}</AvatarFallback>
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
            ) : resourcesError ? (
              <Card className="border-border/50 shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">{resourcesError}</p>
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
