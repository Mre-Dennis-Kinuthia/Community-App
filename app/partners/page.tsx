"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  "Workspace Partner": "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  "Investor": "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  "Partner": "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "Funder": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  "Government": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  "Network": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
}

const categoryColors: Record<string, string> = {
  "Infrastructure": "bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400",
  "Funding": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  "Ecosystem": "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
  "Public Sector": "bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
}

export default function PartnersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get("type") || "all")
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get("category") || "all")
  const [selectedPartner, setSelectedPartner] = useState<typeof partners[0] | null>(null)

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (typeFilter !== "all") params.set("type", typeFilter)
    if (categoryFilter !== "all") params.set("category", categoryFilter)
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, typeFilter, categoryFilter, router])

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesSearch = 
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.focus.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesType = typeFilter === "all" || partner.type === typeFilter
      const matchesCategory = categoryFilter === "all" || partner.category === categoryFilter

      return matchesSearch && matchesType && matchesCategory
    })
  }, [searchQuery, typeFilter, categoryFilter])

  const hasActiveFilters = typeFilter !== "all" || categoryFilter !== "all"

  const clearFilters = () => {
    setTypeFilter("all")
    setCategoryFilter("all")
    setSearchQuery("")
    router.replace(window.location.pathname, { scroll: false })
  }

  const activeFilterCount = [
    typeFilter !== "all",
    categoryFilter !== "all",
    searchQuery.length > 0,
  ].filter(Boolean).length

  const uniqueTypes = Array.from(new Set(partners.map((p) => p.type)))
  const uniqueCategories = Array.from(new Set(partners.map((p) => p.category)))

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
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{partners.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Investors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {partners.filter((p) => p.type === "Investor" || p.type === "Funder").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Global Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">100+</div>
              <p className="text-xs text-muted-foreground mt-1">Impact Hubs</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-card transition-all hover:shadow-card hover:scale-[1.01]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Network Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">25K+</div>
              <p className="text-xs text-muted-foreground mt-1">Members</p>
            </CardContent>
          </Card>
        </div>

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
                <Card
                  key={partner.id}
                  className="border-border/50 shadow-card transition-all hover:shadow-card hover:scale-[1.01] cursor-pointer"
                  onClick={() => setSelectedPartner(partner)}
                >
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
                        <Briefcase className="h-4 w-4" />
                        {partner.location}
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
                        e.stopPropagation()
                        window.open(partner.website, "_blank")
                      }}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Website
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Partner Detail Sheet */}
      <Sheet open={!!selectedPartner} onOpenChange={(open) => !open && setSelectedPartner(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedPartner && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge className={typeColors[selectedPartner.type]}>
                    {selectedPartner.type}
                  </Badge>
                  <Badge className={categoryColors[selectedPartner.category]}>
                    {selectedPartner.category}
                  </Badge>
                </div>
                <SheetTitle className="text-2xl">{selectedPartner.name}</SheetTitle>
                <SheetDescription className="text-base">
                  {selectedPartner.description}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Impact</h3>
                  <p className="text-muted-foreground">{selectedPartner.impact}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">{selectedPartner.location}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Focus Areas</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPartner.focus.map((area, idx) => (
                      <Badge key={idx} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full shadow-sm"
                  onClick={() => window.open(selectedPartner.website, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Website
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  )
}

