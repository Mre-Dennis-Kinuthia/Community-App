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
import { format } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { FilterChip } from "@/components/mobile/filter-chip"
import { FilterChipRow } from "@/components/mobile/filter-chip-row"
import { MobileSearchBar } from "@/components/mobile/mobile-search-bar"
import {
  MobilePageHeader,
  MobileFilterMeta,
  MobileBreadcrumbsHidden,
} from "@/components/mobile/mobile-page-shell"
import { cn } from "@/lib/utils"

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
  const news = Array.isArray(newsResponse?.posts) ? newsResponse.posts : []
  const error = newsError?.message ? "Failed to load news. Please try again later." : null

  useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  const applySearch = (value?: string) => {
    const q = (value ?? searchInput).trim()
    const params = new URLSearchParams(searchParams.toString())
    if (q) params.set("search", q)
    else params.delete("search")
    params.delete("page")
    router.replace(params.toString() ? `?${params.toString()}` : "/news", { scroll: false })
  }

  const setCategoryFilter = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id) params.set("categoryId", id)
    else params.delete("categoryId")
    params.delete("tagId")
    router.replace(params.toString() ? `?${params.toString()}` : "/news", { scroll: false })
  }

  const setTagFilter = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id) params.set("tagId", id)
    else params.delete("tagId")
    params.delete("categoryId")
    router.replace(params.toString() ? `?${params.toString()}` : "/news", { scroll: false })
  }

  const uniqueCategories = Array.from(
    new Map(
      news
        .filter((p) => p.category)
        .map((p) => [p.category!.id, p.category!])
    ).values()
  )
  const uniqueTags = Array.from(
    new Map(
      news.flatMap((p) => p.tags?.map((t) => t.tag) ?? []).map((t) => [t.id, t])
    ).values()
  )

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
      <div className="news-feed-layout">
        {(uniqueCategories.length > 0 || uniqueTags.length > 0) && (
          <aside className="news-feed-sidebar" aria-label="Filter articles">
            <p className="news-feed-sidebar-label">Browse</p>
            <nav className="news-feed-sidebar-nav">
              <button
                type="button"
                className="news-feed-sidebar-link"
                data-active={!categoryId && !tagId ? "true" : "false"}
                onClick={() => {
                  setCategoryFilter("")
                  setTagFilter("")
                }}
              >
                All articles
              </button>
            </nav>
            {uniqueCategories.length > 0 && (
              <div className="mt-6">
                <p className="news-feed-sidebar-label">Categories</p>
                <nav className="news-feed-sidebar-nav">
                  {uniqueCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className="news-feed-sidebar-link"
                      data-active={categoryId === cat.id ? "true" : "false"}
                      onClick={() => setCategoryFilter(categoryId === cat.id ? "" : cat.id)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </nav>
              </div>
            )}
            {uniqueTags.length > 0 && (
              <div className="mt-6">
                <p className="news-feed-sidebar-label">Topics</p>
                <nav className="news-feed-sidebar-nav">
                  {uniqueTags.slice(0, 12).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className="news-feed-sidebar-link"
                      data-active={tagId === tag.id ? "true" : "false"}
                      onClick={() => setTagFilter(tagId === tag.id ? "" : tag.id)}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </nav>
              </div>
            )}
            <p className="mt-8 text-xs text-muted-foreground">
              {loading ? "Loading…" : `${news.length} article${news.length === 1 ? "" : "s"}`}
            </p>
          </aside>
        )}

        <div className="news-feed-main space-y-4 md:space-y-6">
          <div className="news-feed-masthead">
            <Breadcrumbs items={[{ label: "News & Updates" }]} />
            <div className="news-feed-masthead-row">
              <div className="min-w-0">
                <h1 className="news-feed-masthead-title">News & updates</h1>
                <p className="news-feed-masthead-desc">
                  Stories, announcements, and insights from Impact Hub Nairobi.
                </p>
              </div>
              <div className="news-feed-masthead-search relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search articles…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applySearch()}
                  className="border-border bg-background pl-9 pr-9"
                />
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Clear filters"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Active:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="font-normal">
                    &quot;{searchQuery}&quot;
                  </Badge>
                )}
                {activeCategoryName && <Badge variant="outline">{activeCategoryName}</Badge>}
                {activeTagName && <Badge variant="outline">{activeTagName}</Badge>}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          <MobileBreadcrumbsHidden>
            <Breadcrumbs items={[{ label: "News & Updates" }]} />
          </MobileBreadcrumbsHidden>

          <MobilePageHeader
            title="News & updates"
            description="Stories, announcements, and insights from Impact Hub Nairobi."
            className="md:hidden"
          />

          <div className="space-y-3 md:hidden">
            <MobileSearchBar
              value={searchInput}
              onChange={(v) => {
                setSearchInput(v)
                if (!v.trim() && searchQuery) applySearch("")
              }}
              placeholder="Search articles…"
              className="md:max-w-md"
            />
            <div className="flex gap-2 md:hidden">
              <Button type="button" size="sm" className="h-9 rounded-lg px-4" onClick={() => applySearch()}>
                Search
              </Button>
              {hasActiveFilters && (
                <Button type="button" variant="outline" size="sm" className="h-9 rounded-lg" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>

            {(uniqueCategories.length > 0 || uniqueTags.length > 0) && (
              <FilterChipRow>
                <FilterChip
                  label="All"
                  active={!categoryId && !tagId}
                  onClick={() => {
                    setCategoryFilter("")
                    setTagFilter("")
                  }}
                />
                {uniqueCategories.map((cat) => (
                  <FilterChip
                    key={cat.id}
                    label={cat.name}
                    active={categoryId === cat.id}
                    onClick={() => setCategoryFilter(categoryId === cat.id ? "" : cat.id)}
                  />
                ))}
                {uniqueTags.slice(0, 6).map((tag) => (
                  <FilterChip
                    key={tag.id}
                    label={`#${tag.name}`}
                    active={tagId === tag.id}
                    onClick={() => setTagFilter(tagId === tag.id ? "" : tag.id)}
                  />
                ))}
              </FilterChipRow>
            )}

            <MobileFilterMeta
              count={news.length}
              countLabel="articles"
              filterCount={[searchQuery, categoryId, tagId].filter(Boolean).length}
              hasFilters={!!hasActiveFilters}
              onClear={clearFilters}
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-16">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && news.length === 0 && (
            <div className="text-center py-16">
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
            <div className="news-feed-list">
              {news.map((item) => {
                const displayDate = getDisplayDate(item)
                const preview = item.excerpt || stripHtml(item.content)

                return (
                  <article
                    key={item.id}
                    className={cn(
                      "news-feed-card group",
                      item.isPinned && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    <Link href={`/news/${item.id}`} className="flex flex-col md:flex-row">
                      <div className="news-feed-card-media">
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

                      <div className="news-feed-card-body">
                        {/* Category and Tags */}
                        {(item.category || (item.tags?.length ?? 0) > 0) && (
                          <div className="mb-2 flex flex-wrap items-center gap-1.5">
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
                            {(item.tags ?? []).slice(0, 2).map((postTag) => (
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

                        <h2 className="news-feed-card-title group-hover:text-primary mb-1.5 line-clamp-2 transition-colors duration-200 ease-out">
                          {item.title}
                        </h2>

                        {preview && (
                          <p className="news-feed-card-excerpt line-clamp-2 mb-3 flex-1">
                            {preview}
                          </p>
                        )}

                        <div className="news-feed-card-meta mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-2.5">
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
                          <span className="ml-auto flex items-center gap-1 font-medium text-primary transition-[gap] duration-200 ease-out group-hover:gap-1.5">
                            Read
                            <ArrowRight className="h-3 w-3 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
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
