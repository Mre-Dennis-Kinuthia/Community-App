"use client"

import { useState, useMemo, useEffect } from "react"
import useSWR from "swr"
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
  Award,
  ExternalLink,
  MapPin,
  Target,
  Loader2
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { PageHeader } from "@/components/page-header"
import Link from "next/link"

const typeIcons: Record<string, any> = {
  "Workspace Partner": Building2,
  "Investor": TrendingUp,
  "Partner": Handshake,
  "Funder": Award,
  "Government": Building2,
  "Network": Globe,
}

const typeColors: Record<string, string> = {
  "Workspace Partner": "bg-muted text-muted-foreground border border-border",
  "Investor": "bg-muted text-muted-foreground border border-border",
  "Partner": "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/80",
  "Funder": "bg-muted text-muted-foreground border border-border",
  "Government": "bg-muted text-muted-foreground border border-border",
  "Network": "bg-muted text-muted-foreground border border-border",
}

const categoryColors: Record<string, string> = {
  "Infrastructure": "bg-muted text-muted-foreground border border-border",
  "Funding": "bg-muted text-muted-foreground border border-border",
  "Ecosystem": "bg-muted text-muted-foreground border border-border",
  "Public Sector": "bg-muted text-muted-foreground border border-border",
}

export default function PartnersPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "partners")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get("type") || "all")
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get("category") || "all")
  const [locationFilter, setLocationFilter] = useState<string>(searchParams.get("location") || "all")
  
  const partnersParams = new URLSearchParams()
  if (searchQuery) partnersParams.set("search", searchQuery)
  if (typeFilter !== "all") partnersParams.set("type", typeFilter)
  if (categoryFilter !== "all") partnersParams.set("category", categoryFilter)
  if (locationFilter !== "all") partnersParams.set("location", locationFilter)
  const partnersKey = activeTab === "partners" ? `/api/partners?${partnersParams.toString()}` : null
  const { data: partnersResponse, error: partnersError, isLoading: isLoadingPartners } = useSWR<{
    partners?: any[]
    filters?: { types?: string[]; categories?: string[]; locationTypes?: string[] }
  }>(partnersKey)

  const partnersData = partnersResponse?.partners ?? []
  const filters = {
    types: partnersResponse?.filters?.types ?? [],
    categories: partnersResponse?.filters?.categories ?? [],
    locationTypes: partnersResponse?.filters?.locationTypes ?? [],
  }
  const partnersErrorMsg = partnersError?.message ?? null

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (activeTab !== "partners") params.set("tab", activeTab)
    if (searchQuery) params.set("search", searchQuery)
    if (typeFilter !== "all") params.set("type", typeFilter)
    if (categoryFilter !== "all") params.set("category", categoryFilter)
    if (locationFilter !== "all") params.set("location", locationFilter)
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [activeTab, searchQuery, typeFilter, categoryFilter, locationFilter, router])

  const filteredPartners = useMemo(() => {
    return partnersData.filter((partner) => {
      const matchesSearch = 
        partner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.focus?.some((f: string) => f.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesType = typeFilter === "all" || partner.type === typeFilter
      const matchesCategory = categoryFilter === "all" || partner.category === categoryFilter
      const matchesLocation = locationFilter === "all" || partner.locationType === locationFilter

      return matchesSearch && matchesType && matchesCategory && matchesLocation
    })
  }, [partnersData, searchQuery, typeFilter, categoryFilter, locationFilter])

  const clearFilters = () => {
    setTypeFilter("all")
    setCategoryFilter("all")
    setLocationFilter("all")
    setSearchQuery("")
    router.replace(window.location.pathname, { scroll: false })
  }

  const activeFilterCount = [
    typeFilter !== "all",
    categoryFilter !== "all",
    locationFilter !== "all",
    searchQuery.length > 0,
  ].filter(Boolean).length

  const uniqueTypes = filters.types.length > 0 ? filters.types : Array.from(new Set(partnersData.map((p) => p.type).filter(Boolean)))
  const uniqueCategories = filters.categories.length > 0 ? filters.categories : Array.from(new Set(partnersData.map((p) => p.category).filter(Boolean)))
  const uniqueLocationTypes = filters.locationTypes.length > 0 ? filters.locationTypes : Array.from(new Set(partnersData.map((p) => p.locationType).filter(Boolean)))

  const hasActiveFilters = typeFilter !== "all" || categoryFilter !== "all" || locationFilter !== "all"

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <Breadcrumbs items={[{ label: "Partners & Network" }]} />
        <PageHeader
          title="Partners & network"
          description="Connect with investors, partners, and organizations supporting social innovation in Kenya and beyond."
        />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border  transition-all hover:bg-muted/30 ">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{partnersData.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border  transition-all hover:bg-muted/30 ">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Investors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {partnersData.filter((p) => p.type === "Investor" || p.type === "Funder").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border  transition-all hover:bg-muted/30 ">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {partnersData.reduce((sum, p) => sum + (p.opportunitiesCount || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border  transition-all hover:bg-muted/30 ">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Member Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {partnersData.reduce((sum, p) => sum + (p.memberConnections || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-1">
            <TabsTrigger value="partners">Partners</TabsTrigger>
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
            {isLoadingPartners ? (
              <Card className="border-border ">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground text-center">Loading partners...</p>
                </CardContent>
              </Card>
            ) : partnersErrorMsg ? (
              <Card className="border-border ">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">{partnersErrorMsg}</p>
                  <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : filteredPartners.length === 0 ? (
              <Card className="border-border ">
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
                      <Card className="border-border  transition-all hover:bg-muted/30 hover:border-primary/50 cursor-pointer h-full">
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
                            {partner.opportunitiesCount !== undefined && (
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Target className="h-4 w-4" />
                                  <span>{partner.opportunitiesCount || 0} opportunities</span>
                                </div>
                              </div>
                            )}
                            {partner.focus && partner.focus.length > 0 && (
                              <div className="text-sm">
                                <p className="font-medium mb-1">Focus Areas:</p>
                                <div className="flex flex-wrap gap-1">
                                  {partner.focus.slice(0, 3).map((area: string, idx: number) => (
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
                            )}
                          </div>
                          {partner.website && (
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
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
