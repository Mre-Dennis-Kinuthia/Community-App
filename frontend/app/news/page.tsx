"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Newspaper } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { FilterChip } from "@/components/mobile/filter-chip"
import { FilterChipRow } from "@/components/mobile/filter-chip-row"
import { MobileSearchBar } from "@/components/mobile/mobile-search-bar"
import { FilterBarItem } from "@/components/design/filter-bar"
import { EmptyState } from "@/components/design/empty-state"
import {
  ListPageBody,
  ListPageSearchField,
  ListPageShell,
} from "@/components/design/list-page-shell"
import { NewsCard, type NewsCardPost } from "@/components/news/news-card"

type NewsPost = NewsCardPost

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

  const filterCount = [searchQuery, categoryId, tagId].filter(Boolean).length

  /* Editorial partition: hierarchy only when browsing, plain grid when filtering. */
  const showHierarchy = !hasActiveFilters && news.length > 2
  const lead = showHierarchy
    ? news.find((p) => p.isPinned) ?? news.find((p) => p.isFeatured) ?? news[0]
    : null
  const afterLead = lead ? news.filter((p) => p.id !== lead.id) : news
  const secondary = showHierarchy
    ? [...afterLead].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, 2)
    : []
  const secondaryIds = new Set(secondary.map((p) => p.id))
  const rest = showHierarchy
    ? afterLead.filter((p) => !secondaryIds.has(p.id))
    : news

  return (
    <DashboardLayout>
      <ListPageShell
        breadcrumb="News & Updates"
        title="News & updates"
        description="Stories, announcements, and insights from Impact Hub Nairobi."
        resultCount={news.length}
        resultLabel="articles"
        filterCount={filterCount}
        hasActiveFilters={!!hasActiveFilters}
        onClearFilters={clearFilters}
        showDesktopFilterBadge={false}
        mobileFilters={
          <>
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
              {hasActiveFilters ? (
                <Button type="button" variant="outline" size="sm" className="h-9 rounded-lg" onClick={clearFilters}>
                  Clear
                </Button>
              ) : null}
            </div>
          </>
        }
        desktopFilters={
          <>
            <FilterBarItem className="sm:min-w-[280px] sm:flex-1">
              <ListPageSearchField
                value={searchInput}
                onChange={setSearchInput}
                onKeyDown={(e) => e.key === "Enter" && applySearch()}
                placeholder="Search articles…"
              />
            </FilterBarItem>
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
          </>
        }
        filterChips={
          (uniqueCategories.length > 0 || uniqueTags.length > 0) ? (
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
          ) : null
        }
      >
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

        <ListPageBody
          loading={loading}
          loadingMessage="Loading news…"
          error={error}
          errorAction={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
          isEmpty={news.length === 0}
          empty={
            <EmptyState
              icon={Newspaper}
              title={hasActiveFilters ? "No articles match your filters" : "No articles yet"}
              description={
                hasActiveFilters
                  ? "Try clearing filters to see all published updates."
                  : "Hub news and announcements will appear here when published."
              }
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">Back to dashboard</Link>
                  </Button>
                )
              }
            />
          }
        >
          <div className="space-y-5 md:space-y-6">
            {lead ? <NewsCard post={lead} variant="hero" /> : null}

            {secondary.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {secondary.map((item) => (
                  <NewsCard key={item.id} post={item} variant="featured" />
                ))}
              </div>
            ) : null}

            {rest.length > 0 ? (
              <>
                {showHierarchy ? (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="h-1 w-8 rounded-full bg-primary" aria-hidden />
                    <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Latest stories
                    </h2>
                  </div>
                ) : null}
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {rest.map((item) => (
                    <NewsCard key={item.id} post={item} variant="standard" />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </ListPageBody>
      </ListPageShell>
    </DashboardLayout>
  )
}
