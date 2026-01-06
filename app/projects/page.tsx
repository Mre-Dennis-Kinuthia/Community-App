"use client"

import { useState, useMemo, useEffect } from "react"
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
  ExternalLink
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { format } from "date-fns"

const projects = [
  {
    id: 1,
    title: "Green Energy Solutions for Rural Kenya",
    founder: "James Mwangi",
    founderAvatar: "/placeholder-user.jpg",
    category: "Climate & Environment",
    stage: "Scaling",
    impact: "Providing clean energy to 5,000+ rural households",
    description: "Solar-powered microgrids bringing affordable electricity to off-grid communities, reducing reliance on kerosene and improving quality of life.",
    metrics: {
      households: "5,000+",
      emissions: "200 tons CO2",
      jobs: "50+",
    },
    tags: ["Renewable Energy", "Rural Development", "Climate Action"],
    featured: true,
    launchDate: new Date(2024, 5, 15),
  },
  {
    id: 2,
    title: "AgriTech Platform for Smallholder Farmers",
    founder: "Grace Wanjiru",
    founderAvatar: "/placeholder-user.jpg",
    category: "Agriculture",
    stage: "Growth",
    impact: "Connecting 10,000+ farmers to markets and financing",
    description: "Mobile platform connecting smallholder farmers with buyers, providing market information, and facilitating access to credit and inputs.",
    metrics: {
      farmers: "10,000+",
      transactions: "KES 50M+",
      partnerships: "15+",
    },
    tags: ["Agriculture", "FinTech", "Rural Development"],
    featured: true,
    launchDate: new Date(2024, 2, 10),
  },
  {
    id: 3,
    title: "Waste-to-Wealth Recycling Initiative",
    founder: "Peter Ochieng",
    founderAvatar: "/placeholder-user.jpg",
    category: "Circular Economy",
    stage: "Early Stage",
    impact: "Diverting 100+ tons of waste from landfills monthly",
    description: "Community-based recycling program creating income opportunities while addressing plastic waste in Nairobi's informal settlements.",
    metrics: {
      waste: "100+ tons/month",
      collectors: "200+",
      income: "KES 2M+",
    },
    tags: ["Waste Management", "Circular Economy", "Livelihoods"],
    featured: false,
    launchDate: new Date(2024, 8, 1),
  },
  {
    id: 4,
    title: "Digital Health Platform for Maternal Care",
    founder: "Dr. Sarah Kamau",
    founderAvatar: "/placeholder-user.jpg",
    category: "Healthcare",
    stage: "Scaling",
    impact: "Improving maternal health outcomes for 3,000+ women",
    description: "Telemedicine platform providing prenatal and postnatal care to expectant mothers in underserved areas, reducing maternal mortality.",
    metrics: {
      women: "3,000+",
      consultations: "15,000+",
      outcomes: "95% success",
    },
    tags: ["Healthcare", "Telemedicine", "Women's Health"],
    featured: false,
    launchDate: new Date(2023, 11, 5),
  },
  {
    id: 5,
    title: "Financial Inclusion for Youth Entrepreneurs",
    founder: "David Kipchoge",
    founderAvatar: "/placeholder-user.jpg",
    category: "FinTech",
    stage: "Growth",
    impact: "Enabling 2,000+ youth to access financial services",
    description: "Mobile-first financial platform designed for young entrepreneurs, providing savings, credit, and business management tools.",
    metrics: {
      users: "2,000+",
      savings: "KES 10M+",
      loans: "KES 5M+",
    },
    tags: ["FinTech", "Youth", "Financial Inclusion"],
    featured: false,
    launchDate: new Date(2024, 0, 20),
  },
  {
    id: 6,
    title: "Clean Water Access Initiative",
    founder: "Mary Wanjala",
    founderAvatar: "/placeholder-user.jpg",
    category: "Water & Sanitation",
    stage: "Scaling",
    impact: "Providing clean water to 8,000+ people daily",
    description: "Low-cost water purification systems and community water kiosks bringing safe drinking water to urban slums and rural areas.",
    metrics: {
      people: "8,000+",
      liters: "50,000+ daily",
      communities: "12+",
    },
    tags: ["Water", "Sanitation", "Public Health"],
    featured: true,
    launchDate: new Date(2023, 8, 15),
  },
]

const categoryColors: Record<string, string> = {
  "Climate & Environment": "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  "Agriculture": "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "Circular Economy": "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
  "Healthcare": "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  "FinTech": "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "Water & Sanitation": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
}

const stageColors: Record<string, string> = {
  "Early Stage": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  "Growth": "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "Scaling": "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
}

export default function ProjectsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get("category") || "all")
  const [stageFilter, setStageFilter] = useState<string>(searchParams.get("stage") || "all")
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null)

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (categoryFilter !== "all") params.set("category", categoryFilter)
    if (stageFilter !== "all") params.set("stage", stageFilter)
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, categoryFilter, stageFilter, router])

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.founder.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = categoryFilter === "all" || project.category === categoryFilter
      const matchesStage = stageFilter === "all" || project.stage === stageFilter

      return matchesSearch && matchesCategory && matchesStage
    })
  }, [searchQuery, categoryFilter, stageFilter])

  const hasActiveFilters = categoryFilter !== "all" || stageFilter !== "all"

  const clearFilters = () => {
    setCategoryFilter("all")
    setStageFilter("all")
    setSearchQuery("")
    router.replace(window.location.pathname, { scroll: false })
  }

  const activeFilterCount = [
    categoryFilter !== "all",
    stageFilter !== "all",
    searchQuery.length > 0,
  ].filter(Boolean).length

  const uniqueCategories = Array.from(new Set(projects.map((p) => p.category)))
  const uniqueStages = Array.from(new Set(projects.map((p) => p.stage)))

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
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{projects.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Featured</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {projects.filter((p) => p.featured).length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Scaling</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {projects.filter((p) => p.stage === "Scaling").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{uniqueCategories.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
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
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="shadow-sm">
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
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
          <div className="grid gap-6 md:grid-cols-2">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className={`border-border/50 shadow-card transition-all hover:shadow-card hover:scale-[1.01] cursor-pointer ${
                  project.featured ? "ring-2 ring-primary/20" : ""
                }`}
                onClick={() => setSelectedProject(project)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {project.featured && (
                          <Badge className="bg-primary/10 text-primary border-primary/20">
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
                          <AvatarFallback>{project.founder[0]}</AvatarFallback>
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
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag, idx) => (
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
                  <Button variant="outline" className="w-full shadow-sm">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Project Detail Sheet */}
      <Sheet open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedProject && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {selectedProject.featured && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Featured
                    </Badge>
                  )}
                  <Badge className={categoryColors[selectedProject.category]}>
                    {selectedProject.category}
                  </Badge>
                  <Badge className={stageColors[selectedProject.stage]}>
                    {selectedProject.stage}
                  </Badge>
                </div>
                <SheetTitle className="text-2xl">{selectedProject.title}</SheetTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedProject.founderAvatar} alt={selectedProject.founder} />
                    <AvatarFallback>{selectedProject.founder[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">by {selectedProject.founder}</span>
                </div>
                <SheetDescription className="text-base mt-4">
                  {selectedProject.description}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Impact
                  </h3>
                  <p className="text-muted-foreground">{selectedProject.impact}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Key Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedProject.metrics).map(([key, value]) => (
                      <div key={key} className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground capitalize mb-1">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                        <p className="text-lg font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Launched {format(selectedProject.launchDate, "MMM d, yyyy")}
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 shadow-sm">
                    <Users className="mr-2 h-4 w-4" />
                    Connect with Founder
                  </Button>
                  <Button variant="outline" className="flex-1 shadow-sm">
                    <Heart className="mr-2 h-4 w-4" />
                    Support Project
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}

