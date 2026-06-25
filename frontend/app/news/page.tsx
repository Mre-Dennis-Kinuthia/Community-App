"use client"

import { useState, useEffect } from "react"
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
  Tag,
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
import { FilterBar, FilterBarItem } from "@/components/design/filter-bar"
import { EmptyState } from "@/components/design/empty-state"
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

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").substring(0, 200)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-5xl space-y-4 overflow-x-hidden md:space-y-6">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs items={[{ label: "News & Updates" }]} />
        </MobileBreadcrumbsHidden>

        <MobilePageHeader
          title="News & updates"
          description="Stories, announcements, and insights from Impact Hub Nairobi."
        />

        {/* Mobile search */}
        <div className="space-y-3 md:hidden">
          <MobileSearchBar
            value={searchInput}
            onChange={(v) => {
              setSearchInput(v)
              if (!v.trim() && searchQuery) applySearch("")
            }}
            placeholder="Search articles…"
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" className="h-9 rounded-lg px-4" onClick={() => applySearch()}>
              Search
            </Button>
            {hasActiveFilters && (
              <Button type="button" variant="outline" size="sm" className="h-9 rounded-lg" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
          <MobileFilterMeta
            count={news.length}
            countLabel="articles"
            filterCount={[searchQuery, categoryId, tagId].filter(Boolean).length}
            hasFilters={!!hasActiveFilters}
            onClear={clearFilters}
          />
        </div>

        {/* Desktop search */}
        <div className="hidden md:block">
          <FilterBar>
            <FilterBarItem className="sm:min-w-[280px] sm:flex-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search articles…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applySearch()}
                  className="h-9 pl-8"
                />
              </div>
            </FilterBarItem>
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
          </FilterBar>
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
            {uniqueTags.slice(0, 8).map((tag) => (
              <FilterChip
                key={tag.id}
                label={`#${tag.name}`}
                active={tagId === tag.id}
                onClick={() => setTagFilter(tagId === tag.id ? "" : tag.id)}
              />
            ))}
          </FilterChipRow>
        )}

        {hasActiveFilters && (
          <div className="hidden flex-wrap items-center gap-2 md:flex">
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
            <span className="ml-auto text-sm text-muted-foreground">
              {loading ? "Loading…" : `${news.length} article${news.length === 1 ? "" : "s"}`}
            </span>
          </div>
        )}

        {!hasActiveFilters && (
          <p className="hidden text-sm text-muted-foreground md:block">
            {loading ? "Loading…" : `${news.length} article${news.length === 1 ? "" : "s"}`}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading news…
          </div>
        ) : null}

        {error && !loading ? (
          <EmptyState
            title="Could not load news"
            description={error}
            action={
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          />
        ) : null}

        {!loading && !error && news.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? "No articles match your filters" : "No articles yet"}
            description={hasActiveFilters ? "Try clearing filters." : undefined}
            action={
              hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : null}

        {!loading && !error && news.length > 0 && (
          <div className="news-feed-list">
            {news.map((item) => {
              const displayDate = getDisplayDate(item)
              const preview = item.excerpt || stripHtml(item.content)

              return (
                <article
                  key={item.id}
                  className={cn(
                    "news-feed-card",
                    item.isPinned && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  {(item.category || (item.tags?.length ?? 0) > 0) && (
                    <div className="news-feed-card-badges">
                      {item.category && (
                        <button
                          type="button"
                          className="transition-opacity hover:opacity-80"
                          onClick={() =>
                            setCategoryFilter(categoryId === item.category!.id ? "" : item.category!.id)
                          }
                        >
                          <Badge
                            variant="outline"
                            className={cn("text-xs", categoryId === item.category.id && "ring-2 ring-primary ring-offset-1")}
                            style={item.category.color ? { borderColor: item.category.color, color: item.category.color } : undefined}
                          >
                            {item.category.name}
                          </Badge>
                        </button>
                      )}
                      {(item.tags ?? []).slice(0, 3).map((postTag) => (
                        <button
                          key={postTag.tag.id}
                          type="button"
                          className="transition-opacity hover:opacity-80"
                          onClick={() =>
                            setTagFilter(tagId === postTag.tag.id ? "" : postTag.tag.id)
                          }
                        >
                          <Badge
                            variant="outline"
                            className={cn("flex items-center gap-1 text-xs", tagId === postTag.tag.id && "ring-2 ring-primary ring-offset-1")}
                          >
                            <Tag className="h-3 w-3" />
                            {postTag.tag.name}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}

                  <Link href={`/news/${item.id}`} className="news-feed-card-link">
                    <div className="news-feed-card-media">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex aspect-[16/9] items-center justify-center">
                          <Newspaper className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                      )}
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
                      <h2 className="news-feed-card-title">{item.title}</h2>

                      {preview && (
                        <p className="news-feed-card-excerpt line-clamp-2">{preview}</p>
                      )}

                      <div className="news-feed-card-meta">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          {format(displayDate, "MMM d, yyyy")}
                        </span>
                        {item.readingTimeMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {item.readingTimeMinutes} min
                          </span>
                        )}
                        {item.viewCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5 shrink-0" />
                            {item.viewCount}
                          </span>
                        )}
                        <span className="news-feed-card-read">
                          Read
                          <ArrowRight className="h-3 w-3 shrink-0" />
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
    </DashboardLayout>
  )
}
