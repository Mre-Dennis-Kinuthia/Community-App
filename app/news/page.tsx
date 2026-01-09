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
  Newspaper, 
  Search, 
  X,
  Calendar,
  User,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Users,
  Bell
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { format, formatDistanceToNow } from "date-fns"
import Link from "next/link"

const newsItems = [
  {
    id: 1,
    title: "Impact Hub Nairobi Launches New Incubation Program for Climate Startups",
    type: "Announcement",
    category: "Programs",
    author: "Impact Hub Team",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2025, 0, 15),
    excerpt: "We're excited to announce our new 12-week incubation program specifically designed for early-stage climate and sustainability startups. Applications open now!",
    content: "Impact Hub Nairobi is launching a specialized incubation program focused on climate solutions and sustainable innovation. The program will provide selected startups with workspace, mentorship from industry experts, access to our partner network, and opportunities for seed funding. Applications are now open for the March 2025 cohort.",
    image: "/placeholder-user.jpg",
    featured: true,
    tags: ["Programs", "Climate", "Incubation"],
  },
  {
    id: 2,
    title: "Member Spotlight: Green Energy Solutions Reaches 5,000 Households",
    type: "Spotlight",
    category: "Member Success",
    author: "Sarah Kamau",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2025, 0, 10),
    excerpt: "Congratulations to James Mwangi and his team for reaching this incredible milestone in bringing clean energy to rural communities.",
    content: "James Mwangi's Green Energy Solutions project has successfully connected 5,000 rural households to clean, affordable solar power. This achievement represents a significant step forward in Kenya's renewable energy transition and demonstrates the power of social entrepreneurship to create lasting impact.",
    image: "/placeholder-user.jpg",
    featured: true,
    tags: ["Member Success", "Energy", "Impact"],
  },
  {
    id: 3,
    title: "Global Impact Hub Network Meetup: February 2025",
    type: "Event",
    category: "Events",
    author: "Impact Hub Team",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2025, 0, 8),
    excerpt: "Join us for our monthly global network meetup where members from Impact Hubs worldwide come together to share experiences and explore collaborations.",
    content: "This month's global network meetup will feature presentations from Impact Hub members in Lagos, Cape Town, and London. We'll explore cross-continental collaboration opportunities and share best practices for scaling social impact ventures.",
    image: "/placeholder-user.jpg",
    featured: false,
    tags: ["Events", "Networking", "Global"],
  },
  {
    id: 4,
    title: "New Partnership: Ikigai Workspace Expansion",
    type: "Announcement",
    category: "Partnerships",
    author: "Impact Hub Team",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2025, 0, 5),
    excerpt: "We're expanding our partnership with Ikigai to provide even more workspace options for our members, including new wellness studios and collaboration zones.",
    content: "Impact Hub Nairobi is thrilled to announce an expanded partnership with Ikigai, our workspace partner. This expansion includes new wellness studios, additional collaboration zones, and enhanced amenities designed to support the holistic well-being of our innovation community.",
    image: "/placeholder-user.jpg",
    featured: false,
    tags: ["Partnerships", "Workspace", "Infrastructure"],
  },
  {
    id: 5,
    title: "Workshop Recap: Fundraising Strategies for Social Entrepreneurs",
    type: "Recap",
    category: "Workshops",
    author: "David Ochieng",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2024, 11, 28),
    excerpt: "Our recent workshop on fundraising strategies brought together 30 entrepreneurs and 5 experienced investors for an intensive learning session.",
    content: "The workshop covered essential fundraising topics including pitch deck development, investor relations, and alternative funding sources. Participants left with actionable strategies and new connections to potential investors in our network.",
    image: "/placeholder-user.jpg",
    featured: false,
    tags: ["Workshops", "Fundraising", "Education"],
  },
  {
    id: 6,
    title: "Impact Story: How AgriTech Platform Transformed 10,000 Farmers' Lives",
    type: "Impact Story",
    category: "Impact",
    author: "Grace Wanjiru",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2024, 11, 20),
    excerpt: "Grace Wanjiru's AgriTech platform has successfully connected over 10,000 smallholder farmers to markets, financing, and agricultural inputs.",
    content: "Since launching in early 2024, Grace's platform has facilitated over KES 50 million in transactions, connected farmers with 15+ buyers, and enabled access to credit for agricultural inputs. The platform has transformed how smallholder farmers operate, increasing their incomes by an average of 40%.",
    image: "/placeholder-user.jpg",
    featured: true,
    tags: ["Impact", "Agriculture", "Technology"],
  },
  {
    id: 7,
    title: "Upcoming: Social Innovation Bootcamp Applications Open",
    type: "Announcement",
    category: "Programs",
    author: "Impact Hub Team",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2024, 11, 15),
    excerpt: "Applications are now open for our intensive 6-week Social Innovation Bootcamp starting in February 2025.",
    content: "The Social Innovation Bootcamp is designed for ventures ready to scale their impact. The program includes intensive workshops, one-on-one mentorship, investor connections, and access to our global network. Limited spots available - apply early!",
    image: "/placeholder-user.jpg",
    featured: false,
    tags: ["Programs", "Acceleration", "Applications"],
  },
  {
    id: 8,
    title: "Member Achievement: Digital Health Platform Wins Innovation Award",
    type: "Announcement",
    category: "Member Success",
    author: "Impact Hub Team",
    authorAvatar: "/placeholder-user.jpg",
    date: new Date(2024, 11, 10),
    excerpt: "Congratulations to Dr. Sarah Kamau and her team for winning the Healthcare Innovation Award at the Kenya Tech Awards 2024.",
    content: "Dr. Sarah Kamau's digital health platform for maternal care was recognized for its innovative approach to improving healthcare access in underserved areas. The platform has served over 3,000 women with a 95% success rate in improving maternal health outcomes.",
    image: "/placeholder-user.jpg",
    featured: false,
    tags: ["Member Success", "Healthcare", "Awards"],
  },
]

const typeIcons: Record<string, any> = {
  "Announcement": Bell,
  "Spotlight": Sparkles,
  "Event": Calendar,
  "Recap": Newspaper,
  "Impact Story": TrendingUp,
}

const typeColors: Record<string, string> = {
  "Announcement": "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "Spotlight": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  "Event": "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  "Recap": "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  "Impact Story": "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400",
}

const categoryColors: Record<string, string> = {
  "Programs": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  "Member Success": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  "Events": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
  "Partnerships": "bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400",
  "Workshops": "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  "Impact": "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400",
}

export default function NewsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get("type") || "all")
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get("category") || "all")

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (typeFilter !== "all") params.set("type", typeFilter)
    if (categoryFilter !== "all") params.set("category", categoryFilter)
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, typeFilter, categoryFilter, router])

  const filteredNews = useMemo(() => {
    return newsItems.filter((item) => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesType = typeFilter === "all" || item.type === typeFilter
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

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

  const uniqueTypes = Array.from(new Set(newsItems.map((n) => n.type)))
  const uniqueCategories = Array.from(new Set(newsItems.map((n) => n.category)))

  const featuredNews = filteredNews.filter((n) => n.featured)
  const regularNews = filteredNews.filter((n) => !n.featured)

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <Breadcrumbs items={[{ label: "News & Updates" }]} />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">News & Updates</h1>
          <p className="text-muted-foreground text-base">
            Stay informed about hub announcements, member spotlights, impact stories, and upcoming opportunities.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search news, announcements, stories..."
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

        {/* Featured News */}
        {featuredNews.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Featured</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredNews.map((item) => {
                const TypeIcon = typeIcons[item.type] || Newspaper
                return (
                  <Link key={item.id} href={`/news/${item.id}`}>
                    <Card
                      className="border-border/50 shadow-card transition-all hover:shadow-card hover:scale-[1.01] cursor-pointer ring-2 ring-primary/20"
                    >
                    <CardHeader>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge className={typeColors[item.type]}>
                          <TypeIcon className="mr-1 h-3 w-3" />
                          {item.type}
                        </Badge>
                        <Badge className={categoryColors[item.category]}>
                          {item.category}
                        </Badge>
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          Featured
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <CardDescription className="text-base line-clamp-2">
                        {item.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={item.authorAvatar} alt={item.author} />
                            <AvatarFallback>{item.author[0]}</AvatarFallback>
                          </Avatar>
                          <span>{item.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(item.date, { addSuffix: true })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Regular News */}
        <div className="space-y-4">
          {featuredNews.length > 0 && <h2 className="text-xl font-semibold">All Updates</h2>}
          {regularNews.length === 0 && filteredNews.length === 0 ? (
            <Card className="border-border/50 shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No news found matching your filters.
                </p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regularNews.map((item) => {
                const TypeIcon = typeIcons[item.type] || Newspaper
                return (
                  <Link key={item.id} href={`/news/${item.id}`}>
                    <Card
                      className="border-border/50 shadow-card transition-all hover:shadow-card hover:scale-[1.01] cursor-pointer"
                    >
                    <CardHeader>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge className={typeColors[item.type]}>
                          <TypeIcon className="mr-1 h-3 w-3" />
                          {item.type}
                        </Badge>
                        <Badge className={categoryColors[item.category]}>
                          {item.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {item.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{item.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(item.date, "MMM d")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

