"use client"

import { Suspense, useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Building2, 
  Search, 
  X,
  Globe,
  Handshake,
  TrendingUp,
  Users,
  Briefcase,
  Award,
  ExternalLink,
  Calendar,
  DollarSign,
  Target,
  MapPin,
  CheckCircle2
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import Link from "next/link"
import { format } from "date-fns"

const partners = [
  {
    id: 1,
    name: "Ikigai",
    type: "Workspace Partner",
    category: "Infrastructure",
    logo: "/placeholder-user.jpg",
    description: "Premium workspace partner providing modern collaboration spaces and wellness studios.",
    website: "https://ikigai.com",
    focus: ["Workspace", "Wellness", "Collaboration"],
    impact: "Enabling flexible work environments for social entrepreneurs",
    location: "Nairobi, Kenya",
    locationType: "Local",
    benefits: ["20% discount on workspace", "Free wellness sessions", "Access to collaboration zones"],
    memberConnections: 45,
    opportunitiesCount: 2,
    successStories: ["15 members accessed workspace in 2024", "Wellness program reached 200+ entrepreneurs"],
    partnershipTier: "Strategic Partner",
    contactEmail: "partnerships@ikigai.com",
  },
  {
    id: 2,
    name: "Acumen Fund",
    type: "Investor",
    category: "Funding",
    logo: "/placeholder-user.jpg",
    description: "Patient capital investor supporting social enterprises tackling poverty.",
    website: "https://acumen.org",
    focus: ["Impact Investing", "Patient Capital", "Social Enterprise"],
    impact: "Invested $150M+ in social enterprises across Africa",
    location: "Global",
    locationType: "Global",
    benefits: ["Investment readiness workshops", "Access to patient capital", "Mentorship from investment team"],
    memberConnections: 12,
    opportunitiesCount: 1,
    successStories: ["3 Impact Hub members received funding totaling $2.5M", "Mentorship program supported 50 entrepreneurs"],
    partnershipTier: "Strategic Partner",
    contactEmail: "kenya@acumen.org",
  },
  {
    id: 3,
    name: "Kenya Climate Innovation Center",
    type: "Partner",
    category: "Ecosystem",
    logo: "/placeholder-user.jpg",
    description: "Supporting climate-focused entrepreneurs with funding, mentorship, and market access.",
    website: "https://kcic.co.ke",
    focus: ["Climate Solutions", "Green Tech", "Sustainability"],
    impact: "Accelerated 200+ climate startups in East Africa",
    location: "Nairobi, Kenya",
    locationType: "Local",
    benefits: ["Climate tech acceleration program", "Grant opportunities up to KES 5M", "Market access support"],
    memberConnections: 28,
    opportunitiesCount: 3,
    successStories: ["8 members graduated from acceleration program", "KES 15M in grants distributed"],
    partnershipTier: "Supporting Partner",
    contactEmail: "info@kcic.co.ke",
  },
  {
    id: 4,
    name: "Mastercard Foundation",
    type: "Funder",
    category: "Funding",
    logo: "/placeholder-user.jpg",
    description: "Supporting young entrepreneurs and social innovation across Africa.",
    website: "https://mastercardfdn.org",
    focus: ["Youth Entrepreneurship", "Education", "Financial Inclusion"],
    impact: "Empowering 30M+ young people across Africa",
    location: "Global",
    locationType: "Global",
    benefits: ["Youth entrepreneurship grants", "Educational resources", "Financial inclusion programs"],
    memberConnections: 35,
    opportunitiesCount: 2,
    successStories: ["20 youth entrepreneurs supported", "KES 25M in grants awarded"],
    partnershipTier: "Strategic Partner",
    contactEmail: "eafrica@mastercardfdn.org",
  },
  {
    id: 5,
    name: "Ministry of ICT, Innovation & Youth Affairs",
    type: "Government",
    category: "Public Sector",
    logo: "/placeholder-user.jpg",
    description: "Government partner supporting innovation and digital transformation initiatives.",
    website: "https://ict.go.ke",
    focus: ["Policy", "Digital Innovation", "Youth Development"],
    impact: "Shaping innovation policy and supporting tech ecosystem",
    location: "Nairobi, Kenya",
    locationType: "Local",
    benefits: ["Policy updates and insights", "Government procurement opportunities", "Regulatory guidance"],
    memberConnections: 18,
    opportunitiesCount: 1,
    successStories: ["10 members participated in government programs", "Policy input sessions with 50+ entrepreneurs"],
    partnershipTier: "Strategic Partner",
    contactEmail: "innovation@ict.go.ke",
  },
  {
    id: 6,
    name: "Impact Hub Global Network",
    type: "Network",
    category: "Ecosystem",
    logo: "/placeholder-user.jpg",
    description: "Access to 100+ Impact Hubs worldwide, connecting local innovators to global opportunities.",
    website: "https://impacthub.net",
    focus: ["Global Network", "Cross-Hub Collaboration", "International Opportunities"],
    impact: "100+ hubs, 25,000+ members, 15,000+ ventures supported",
    location: "Global",
    locationType: "Global",
    benefits: ["Access to 100+ Impact Hubs worldwide", "Global member directory", "International collaboration opportunities"],
    memberConnections: 150,
    opportunitiesCount: 5,
    successStories: ["20 members connected with international partners", "5 cross-hub collaborations initiated"],
    partnershipTier: "Network Partner",
    contactEmail: "network@impacthub.net",
  },
  {
    id: 7,
    name: "Village Capital",
    type: "Investor",
    category: "Funding",
    logo: "/placeholder-user.jpg",
    description: "Early-stage investor using peer selection to fund underrepresented entrepreneurs.",
    website: "https://vilcap.com",
    focus: ["Early-Stage", "Peer Selection", "Diversity"],
    impact: "Invested in 150+ companies across emerging markets",
    location: "Global",
    locationType: "Global",
    benefits: ["Peer selection investment opportunities", "Early-stage funding up to $250K", "Diversity-focused programs"],
    memberConnections: 8,
    opportunitiesCount: 1,
    successStories: ["2 members received investment through peer selection", "15 entrepreneurs in mentorship program"],
    partnershipTier: "Supporting Partner",
    contactEmail: "africa@vilcap.com",
  },
  {
    id: 8,
    name: "Nairobi Business Angels Network",
    type: "Investor",
    category: "Funding",
    logo: "/placeholder-user.jpg",
    description: "Angel investor network connecting startups with experienced investors.",
    website: "https://nban.co.ke",
    focus: ["Angel Investing", "Mentorship", "Startup Funding"],
    impact: "Facilitated $5M+ in startup investments",
    location: "Nairobi, Kenya",
    locationType: "Local",
    benefits: ["Angel investor connections", "Pitch opportunities", "Mentorship from experienced investors"],
    memberConnections: 22,
    opportunitiesCount: 2,
    successStories: ["5 members secured angel investment totaling $1.2M", "Monthly pitch sessions with 50+ investors"],
    partnershipTier: "Supporting Partner",
    contactEmail: "info@nban.co.ke",
  },
]

const partnershipOpportunities = [
  {
    id: 1,
    partnerId: 2,
    partnerName: "Acumen Fund",
    title: "Patient Capital Investment Opportunity",
    description: "Acumen Fund is accepting applications for patient capital investment in social enterprises focused on poverty alleviation.",
    category: "Funding",
    amount: "$50K - $2M",
    deadline: new Date(2026, 3, 30),
    eligibility: ["Early to growth stage", "Social impact focus", "Sub-Saharan Africa operations"],
    applicationProcess: ["Submit expression of interest", "Initial screening", "Due diligence", "Investment decision"],
    status: "Open",
  },
  {
    id: 2,
    partnerId: 4,
    partnerName: "Mastercard Foundation",
    title: "Youth Entrepreneurship Grant Program",
    description: "Grant funding for youth-led social enterprises (ages 18-35) focused on education, financial inclusion, or employment.",
    category: "Funding",
    amount: "KES 500K - KES 5M",
    deadline: new Date(2026, 2, 15),
    eligibility: ["Youth-led (18-35)", "Social impact focus", "Kenya-based"],
    applicationProcess: ["Online application", "Review panel", "Pitch presentation", "Grant award"],
    status: "Open",
  },
  {
    id: 3,
    partnerId: 3,
    partnerName: "Kenya Climate Innovation Center",
    title: "Climate Tech Acceleration Program",
    description: "6-month acceleration program for climate-focused startups with funding, mentorship, and market access support.",
    category: "Program",
    amount: "KES 2M grant + acceleration support",
    deadline: new Date(2026, 1, 28),
    eligibility: ["Climate/Green tech focus", "Early stage", "Kenya-based"],
    applicationProcess: ["Application submission", "Selection process", "Program participation", "Graduation"],
    status: "Open",
  },
  {
    id: 4,
    partnerId: 7,
    partnerName: "Village Capital",
    title: "Peer Selection Investment Program",
    description: "Early-stage investment opportunity using peer selection methodology for underrepresented entrepreneurs.",
    category: "Funding",
    amount: "Up to $250K",
    deadline: new Date(2026, 4, 20),
    eligibility: ["Early stage", "Underrepresented founder", "Tech-enabled solution"],
    applicationProcess: ["Application", "Peer review", "Selection", "Investment"],
    status: "Open",
  },
  {
    id: 5,
    partnerId: 1,
    partnerName: "Ikigai",
    title: "Workspace Partnership Program",
    description: "Discounted workspace access for Impact Hub members with wellness and collaboration benefits.",
    category: "Resource",
    amount: "20% discount",
    deadline: null,
    eligibility: ["Active Impact Hub member", "Nairobi-based"],
    applicationProcess: ["Member verification", "Space allocation", "Onboarding"],
    status: "Ongoing",
  },
]

const typeIcons: Record<string, any> = {
  "Workspace Partner": Building2,
  "Investor": TrendingUp,
  "Partner": Handshake,
  "Funder": Award,
  "Government": Building2,
  "Network": Globe,
}

const typeColors: Record<string, string> = {
  "Workspace Partner": "bg-chart-5/20 text-chart-5 dark:bg-chart-5/20 dark:text-chart-5/80",
  "Investor": "bg-chart-3/20 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3/80",
  "Partner": "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/80",
  "Funder": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  "Government": "bg-chart-2/20 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2/80",
  "Network": "bg-chart-2/20 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2/80",
}

const categoryColors: Record<string, string> = {
  "Infrastructure": "bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400",
  "Funding": "bg-chart-3/20 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3/80",
  "Ecosystem": "bg-chart-2/20 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2/80",
  "Public Sector": "bg-chart-5/20 text-chart-5 dark:bg-chart-5/20 dark:text-chart-5/80",
}

const opportunityCategoryColors: Record<string, string> = {
  "Funding": "bg-chart-3/20 text-chart-3 dark:bg-chart-3/20 dark:text-chart-3/80",
  "Program": "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/80",
  "Resource": "bg-chart-5/20 text-chart-5 dark:bg-chart-5/20 dark:text-chart-5/80",
}

function PartnersPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "partners")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get("type") || "all")
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get("category") || "all")
  const [locationFilter, setLocationFilter] = useState<string>(searchParams.get("location") || "all")
  const [opportunityCategoryFilter, setOpportunityCategoryFilter] = useState<string>(searchParams.get("oppCategory") || "all")

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (activeTab !== "partners") params.set("tab", activeTab)
    if (searchQuery) params.set("search", searchQuery)
    if (typeFilter !== "all") params.set("type", typeFilter)
    if (categoryFilter !== "all") params.set("category", categoryFilter)
    if (locationFilter !== "all") params.set("location", locationFilter)
    if (opportunityCategoryFilter !== "all" && activeTab === "opportunities") params.set("oppCategory", opportunityCategoryFilter)
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [activeTab, searchQuery, typeFilter, categoryFilter, locationFilter, opportunityCategoryFilter, router])

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSearch = 
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.focus.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesType = typeFilter === "all" || partner.type === typeFilter
      const matchesCategory = categoryFilter === "all" || partner.category === categoryFilter
      const matchesLocation = locationFilter === "all" || partner.locationType === locationFilter

      return matchesSearch && matchesType && matchesCategory && matchesLocation
    })
  }, [searchQuery, typeFilter, categoryFilter, locationFilter])

  const filteredOpportunities = useMemo(() => {
    return partnershipOpportunities.filter((opp) => {
      const matchesSearch = 
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = opportunityCategoryFilter === "all" || opp.category === opportunityCategoryFilter

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, opportunityCategoryFilter])

  const clearFilters = () => {
    setTypeFilter("all")
    setCategoryFilter("all")
    setLocationFilter("all")
    setOpportunityCategoryFilter("all")
    setSearchQuery("")
    router.replace(window.location.pathname, { scroll: false })
  }

  const activeFilterCount = [
    typeFilter !== "all",
    categoryFilter !== "all",
    locationFilter !== "all",
    opportunityCategoryFilter !== "all",
    searchQuery.length > 0,
  ].filter(Boolean).length

  const uniqueTypes = Array.from(new Set(partners.map((p) => p.type)))
  const uniqueCategories = Array.from(new Set(partners.map((p) => p.category)))
  const uniqueLocationTypes = Array.from(new Set(partners.map((p) => p.locationType)))
  const uniqueOpportunityCategories = Array.from(new Set(partnershipOpportunities.map((o) => o.category)))

  const hasActiveFilters = typeFilter !== "all" || categoryFilter !== "all" || locationFilter !== "all" || (activeTab === "opportunities" && opportunityCategoryFilter !== "all")

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <Breadcrumbs items={[{ label: "Partners & Network" }]} />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Partners & Network</h1>
          <p className="text-muted-foreground text-base">
            Connect with investors, partners, and organizations supporting social innovation in Kenya and beyond.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card ">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{partners.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card ">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Investors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {partners.filter((p) => p.type === "Investor" || p.type === "Funder").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card ">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{partnershipOpportunities.filter(o => o.status === "Open").length}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card ">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Member Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {partners.reduce((sum, p) => sum + p.memberConnections, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="opportunities">Partnership Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-6 mt-6">
            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search partners, investors, organizations..."
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px] shadow-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-[180px] shadow-sm">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocationTypes.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
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

            {/* Partners Grid */}
            {filteredPartners.length === 0 ? (
              <Card className="border-border/50 shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No partners found matching your filters.
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPartners.map((partner) => {
                  const TypeIcon = typeIcons[partner.type] || Building2
                  return (
                    <Link key={partner.id} href={`/partners/${partner.id}`}>
                      <Card className="border-border/50 shadow-card transition-all hover:shadow-card hover:border-primary/50 cursor-pointer h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={typeColors[partner.type]}>
                                  <TypeIcon className="mr-1 h-3 w-3" />
                                  {partner.type}
                                </Badge>
                                <Badge className={categoryColors[partner.category]}>
                                  {partner.category}
                                </Badge>
                              </div>
                              <CardTitle className="text-xl">{partner.name}</CardTitle>
                              <CardDescription className="text-base line-clamp-2">
                                {partner.description}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {partner.location}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{partner.memberConnections} connections</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                <span>{partner.opportunitiesCount} opportunities</span>
                              </div>
                            </div>
                            <div className="text-sm">
                              <p className="font-medium mb-1">Focus Areas:</p>
                              <div className="flex flex-wrap gap-1">
                                {partner.focus.slice(0, 3).map((area, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {area}
                                  </Badge>
                                ))}
                                {partner.focus.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{partner.focus.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full shadow-sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              window.open(partner.website, "_blank")
                            }}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Visit Website
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6 mt-6">
            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
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
              <Select value={opportunityCategoryFilter} onValueChange={setOpportunityCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px] shadow-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueOpportunityCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
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

            {/* Opportunities List */}
            {filteredOpportunities.length === 0 ? (
              <Card className="border-border/50 shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No opportunities found matching your filters.
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOpportunities.map((opportunity) => (
                  <Link key={opportunity.id} href={`/partners/${opportunity.partnerId}`}>
                    <Card className="border-border/50 shadow-card transition-all hover:shadow-card hover:border-primary/50 cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={opportunityCategoryColors[opportunity.category]}>
                                {opportunity.category}
                              </Badge>
                              <Badge variant={opportunity.status === "Open" ? "default" : "secondary"}>
                                {opportunity.status}
                              </Badge>
                              {opportunity.deadline && (
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  Deadline: {format(opportunity.deadline, "MMM d, yyyy")}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                            <CardDescription className="text-base">
                              by {opportunity.partnerName}
                            </CardDescription>
                            <p className="text-sm text-muted-foreground mt-2">
                              {opportunity.description}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              Amount/Value
                            </p>
                            <p className="text-sm text-muted-foreground">{opportunity.amount}</p>
                          </div>
                          {opportunity.deadline && (
                            <div>
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                Application Deadline
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(opportunity.deadline, "MMMM d, yyyy")}
                              </p>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Eligibility Requirements</p>
                          <ul className="space-y-1">
                            {opportunity.eligibility.map((req, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" className="flex-1" onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            router.push(`/partners/${opportunity.partnerId}`)
                          }}>
                            View Partner Details
                          </Button>
                          <Button className="flex-1" onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            // In a real app, this would navigate to application form
                            alert("Application form would open here")
                          }}>
                            Apply Now
                          </Button>
                        </div>
                      </CardContent>
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

export default function PartnersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PartnersPageContent />
    </Suspense>
  )
}
