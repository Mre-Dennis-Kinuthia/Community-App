"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Newspaper, 
  Search, 
  X,
  Calendar,
  Loader2
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { format, formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface NewsPost {
  id: string
  title: string
  content: string
  excerpt: string | null
  imageUrl: string | null
  publishedAt: Date | null
  createdAt: Date
}

export default function NewsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [news, setNews] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch news from API
  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams()
        if (searchQuery) {
          params.set("search", searchQuery)
        }
        params.set("limit", "50") // Get more items for client-side filtering
        
        const response = await fetch(`/api/news?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Failed to fetch news")
        }
        const data = await response.json()
        setNews(data.posts || [])
      } catch (err) {
        console.error("Error fetching news:", err)
        setError("Failed to load news. Please try again later.")
        setNews([])
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timer = setTimeout(() => {
      fetchNews()
    }, searchQuery ? 500 : 0)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update URL params when search changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, router])

  const filteredNews = useMemo(() => {
    if (!searchQuery) return news
    
    const query = searchQuery.toLowerCase()
    return news.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.excerpt?.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
      )
    })
  }, [news, searchQuery])

  const clearFilters = () => {
    setSearchQuery("")
    router.replace(window.location.pathname, { scroll: false })
  }

  const hasActiveFilters = searchQuery.length > 0

  // Show featured news (first 2 items) and regular news
  const featuredNews = filteredNews.slice(0, 2)
  const regularNews = filteredNews.slice(2)

  const getDisplayDate = (item: NewsPost) => {
    if (item.publishedAt) {
      return new Date(item.publishedAt)
    }
    return new Date(item.createdAt)
  }

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
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="shadow-sm">
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="border-border/50 shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Featured News */}
        {!loading && !error && featuredNews.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Featured</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredNews.map((item) => {
                const displayDate = getDisplayDate(item)
                return (
                  <Link key={item.id} href={`/news/${item.id}`}>
                    <Card className="border-border/50 shadow-card transition-all hover:shadow-card cursor-pointer ring-2 ring-primary/20">
                      {item.imageUrl && (
                        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <Badge className="bg-primary/10 text-primary border-primary/20 mb-2 w-fit">
                          Featured
                        </Badge>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <CardDescription className="text-base line-clamp-2">
                          {item.excerpt || item.content.substring(0, 150) + "..."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-end text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDistanceToNow(displayDate, { addSuffix: true })}
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
        {!loading && !error && (
          <div className="space-y-4">
            {featuredNews.length > 0 && <h2 className="text-xl font-semibold">All Updates</h2>}
            {regularNews.length === 0 && filteredNews.length === 0 ? (
              <Card className="border-border/50 shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    {searchQuery ? "No news found matching your search." : "No news posts available yet."}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters} className="mt-4">
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {regularNews.map((item) => {
                  const displayDate = getDisplayDate(item)
                  return (
                    <Link key={item.id} href={`/news/${item.id}`}>
                      <Card className="border-border/50 shadow-card transition-all hover:shadow-card cursor-pointer">
                        {item.imageUrl && (
                          <div className="relative h-32 w-full overflow-hidden rounded-t-lg">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                          <CardDescription className="text-sm line-clamp-2">
                            {item.excerpt || item.content.substring(0, 100) + "..."}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-end text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(displayDate, "MMM d, yyyy")}
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
        )}
      </div>
    </DashboardLayout>
  )
}

