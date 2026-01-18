"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Newspaper, 
  Search, 
  X,
  Calendar,
  Loader2,
  ArrowRight
} from "lucide-react"
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
        params.set("limit", "50")
        
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

    const timer = setTimeout(() => {
      fetchNews()
    }, searchQuery ? 500 : 0)

    return () => clearTimeout(timer)
  }, [searchQuery])

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

  const getDisplayDate = (item: NewsPost) => {
    if (item.publishedAt) {
      return new Date(item.publishedAt)
    }
    return new Date(item.createdAt)
  }

  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").substring(0, 200)
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {/* Medium-style Header */}
        <div className="border-b border-border/50 bg-background/95 backdrop-blur">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
                News & Updates
              </h1>
              <p className="text-xl text-muted-foreground" style={{ fontFamily: "Georgia, serif" }}>
                Stories, announcements, and insights from Impact Hub Nairobi
              </p>
              
              {/* Search */}
              <div className="relative max-w-md mt-6">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-border/50 bg-background"
                />
                {searchQuery && (
                  <button
                    onClick={clearFilters}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-20">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && filteredNews.length === 0 && (
            <div className="text-center py-20">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No articles found matching your search." : "No articles available yet."}
              </p>
            </div>
          )}

          {/* Medium-style Article List */}
          {!loading && !error && filteredNews.length > 0 && (
            <div className="space-y-16">
              {filteredNews.map((item) => {
                const displayDate = getDisplayDate(item)
                const preview = item.excerpt || stripHtml(item.content)
                
                return (
                  <article key={item.id} className="group">
                    <Link href={`/news/${item.id}`} className="block">
                      {/* Featured Image */}
                      {item.imageUrl && (
                        <div className="mb-6 overflow-hidden rounded-lg">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      
                      {/* Article Content */}
                      <div className="space-y-4">
                        <h2 
                          className="text-3xl font-bold leading-tight group-hover:text-primary transition-colors"
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          {item.title}
                        </h2>
                        
                        {preview && (
                          <p 
                            className="text-lg text-muted-foreground leading-relaxed line-clamp-3"
                            style={{ fontFamily: "Georgia, serif" }}
                          >
                            {preview}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{format(displayDate, "MMMM d, yyyy")}</span>
                          </div>
                          <span>•</span>
                          <span className="group-hover:text-primary transition-colors flex items-center gap-1">
                            Read more
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
