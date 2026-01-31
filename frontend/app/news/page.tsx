"use client"

import { useState, useMemo, useEffect } from "react"
import useSWR from "swr"
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
  ArrowRight,
  Clock,
  Eye,
  Pin,
  Star,
  Tag
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface NewsTag {
  id: string
  name: string
  slug: string
}

interface NewsPostTag {
  tag: NewsTag
}

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
}

interface Author {
  id: string
  name: string | null
  email: string
}

interface NewsPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  imageUrl: string | null
  publishedAt: Date | null
  createdAt: Date
  isFeatured: boolean
  isPinned: boolean
  viewCount: number
  readingTimeMinutes: number | null
  author: Author | null
  category: Category | null
  tags: NewsPostTag[]
}

export default function NewsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const searchQuery = searchParams.get("search") || ""
  const categoryId = searchParams.get("categoryId") || ""
  const tagId = searchParams.get("tagId") || ""
  const [searchInput, setSearchInput] = useState(searchQuery)

  const newsParams = new URLSearchParams()
  if (searchQuery) newsParams.set("search", searchQuery)
  if (categoryId) newsParams.set("categoryId", categoryId)
  if (tagId) newsParams.set("tagId", tagId)
  newsParams.set("limit", "50")
  const newsKey = `/api/news?${newsParams.toString()}`
  const { data: newsResponse, error: newsError, isLoading: loading } = useSWR<{ posts?: NewsPost[] }>(newsKey)
  const news = newsResponse?.posts ?? []
  const error = newsError?.message ? "Failed to load news. Please try again later." : null

  useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  const applySearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchInput.trim()) params.set("search", searchInput.trim())
    else params.delete("search")
    params.delete("page")
    router.replace(params.toString() ? `?${params.toString()}` : "/news", { scroll: false })
  }

  const clearFilters = () => {
    setSearchInput("")
    router.replace("/news", { scroll: false })
  }

  const hasActiveFilters = searchQuery || categoryId || tagId
  const activeCategoryName =
    categoryId && (news.find((p) => p.category?.id === categoryId)?.category?.name ?? "Category")
  const activeTagName =
    tagId && (news.find((p) => p.tags?.some((t) => t.tag.id === tagId))?.tags?.find((t) => t.tag.id === tagId)?.tag.name ?? "Tag")

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
              <div className="flex gap-2 max-w-md mt-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search articles..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applySearch()}
                    className="pl-9 pr-9 border-border/50 bg-background transition-colors duration-200 ease-out focus:ring-2 focus:ring-primary/20"
                  />
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground transition-colors duration-200 ease-out hover:bg-muted hover:text-foreground"
                      aria-label="Clear filters"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="shrink-0 transition-colors duration-200 ease-out"
                  onClick={applySearch}
                  aria-label="Search"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Active filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-sm text-muted-foreground">Filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="font-normal">
                      Search: &quot;{searchQuery}&quot;
                    </Badge>
                  )}
                  {activeCategoryName && (
                    <Badge variant="outline">{activeCategoryName}</Badge>
                  )}
                  {activeTagName && (
                    <Badge variant="outline">{activeTagName}</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
                    onClick={clearFilters}
                  >
                    Clear all
                  </Button>
                </div>
              )}
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

          {!loading && !error && news.length === 0 && (
            <div className="text-center py-20">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {hasActiveFilters ? "No articles match your filters. Try clearing them." : "No articles available yet."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" className="mt-4 transition-colors duration-200 ease-out" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* Article Grid */}
          {!loading && !error && news.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {news.map((item) => {
                const displayDate = getDisplayDate(item)
                const preview = item.excerpt || stripHtml(item.content)

                return (
                  <article
                    key={item.id}
                    className={`group flex flex-col rounded-xl border border-border/50 bg-card overflow-hidden transition-all duration-200 ease-out hover:shadow-md hover:border-border ${
                      item.isPinned ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                  >
                    <Link href={`/news/${item.id}`} className="flex flex-col flex-1">
                      {/* Featured Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Newspaper className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                        {/* Badges overlay */}
                        {(item.isPinned || item.isFeatured) && (
                          <div className="absolute top-2 left-2 flex gap-2">
                            {item.isPinned && (
                              <Badge variant="default" className="flex items-center gap-1 shadow-sm">
                                <Pin className="h-3 w-3" />
                                Pinned
                              </Badge>
                            )}
                            {item.isFeatured && (
                              <Badge variant="secondary" className="flex items-center gap-1 shadow-sm">
                                <Star className="h-3 w-3" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card content */}
                      <div className="flex flex-1 flex-col p-5">
                        {/* Category and Tags */}
                        {(item.category || item.tags.length > 0) && (
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {item.category && (
                              <Link
                                href={categoryId === item.category.id ? "/news" : `/news?categoryId=${item.category.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-block transition-opacity duration-200 ease-out hover:opacity-80"
                              >
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${categoryId === item.category.id ? "ring-2 ring-primary ring-offset-1" : ""}`}
                                  style={item.category.color ? { borderColor: item.category.color, color: item.category.color } : undefined}
                                >
                                  {item.category.name}
                                </Badge>
                              </Link>
                            )}
                            {item.tags.slice(0, 2).map((postTag) => (
                              <Link
                                key={postTag.tag.id}
                                href={tagId === postTag.tag.id ? "/news" : `/news?tagId=${postTag.tag.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-block transition-opacity duration-200 ease-out hover:opacity-80"
                              >
                                <Badge
                                  variant="outline"
                                  className={`text-xs flex items-center gap-1 ${tagId === postTag.tag.id ? "ring-2 ring-primary ring-offset-1" : ""}`}
                                >
                                  <Tag className="h-3 w-3" />
                                  {postTag.tag.name}
                                </Badge>
                              </Link>
                            ))}
                          </div>
                        )}

                        <h2
                          className="text-xl font-bold leading-snug group-hover:text-primary transition-colors duration-200 ease-out line-clamp-2 mb-2"
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          {item.title}
                        </h2>

                        {preview && (
                          <p
                            className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1 mb-4"
                            style={{ fontFamily: "Georgia, serif" }}
                          >
                            {preview}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>{format(displayDate, "MMM d, yyyy")}</span>
                          </div>
                          {item.readingTimeMinutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span>{item.readingTimeMinutes} min</span>
                            </div>
                          )}
                          {item.viewCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5 shrink-0" />
                              <span>{item.viewCount}</span>
                            </div>
                          )}
                          <span className="ml-auto flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-[gap] duration-200 ease-out">
                            Read
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
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
