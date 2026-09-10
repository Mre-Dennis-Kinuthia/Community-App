"use client"

import { useMemo, useState, useEffect } from "react"
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
import type { NewsletterEdition } from "@/components/news/newsletters-archive-list"
import {
  NEWS_HUB_PATH,
  NEWSLETTER_CATEGORY,
  NEWSLETTER_CATEGORY_ID,
} from "@/lib/news-hub"

type NewsPost = NewsCardPost

function editionToCard(c: NewsletterEdition): NewsCardPost {
  const when = c.sentAt || new Date().toISOString()
  return {
    id: `newsletter:${c.id}`,
    title: c.title,
    slug: c.slug,
    content: "",
    excerpt: c.preheader || c.subject,
    imageUrl: c.coverImageUrl ?? null,
    publishedAt: when,
    createdAt: when,
    isFeatured: false,
    isPinned: false,
    viewCount: 0,
    readingTimeMinutes: null,
    author: null,
    category: { ...NEWSLETTER_CATEGORY },
    tags: [],
    href: `/newsletters/${c.slug}`,
  }
}

function itemDate(post: NewsCardPost): number {
  return new Date(post.publishedAt ?? post.createdAt).getTime()
}

export default function NewsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const searchQuery = searchParams.get("search") || ""
  const rawCategoryId = searchParams.get("categoryId") || ""
  const tabParam = searchParams.get("tab")
  const categoryId =
    rawCategoryId || (tabParam === "newsletters" ? NEWSLETTER_CATEGORY_ID : "")
  const tagId = searchParams.get("tagId") || ""
  const [searchInput, setSearchInput] = useState(searchQuery)

  const newsParams = new URLSearchParams()
  if (searchQuery) newsParams.set("search", searchQuery)
  if (categoryId && categoryId !== NEWSLETTER_CATEGORY_ID) {
    newsParams.set("categoryId", categoryId)
  }
  if (tagId) newsParams.set("tagId", tagId)
  newsParams.set("limit", "50")

  const { data: newsResponse, error: newsError, isLoading: newsLoading } = useSWR<{
    posts?: NewsPost[]
  }>(`/api/news?${newsParams.toString()}`)
  const news = Array.isArray(newsResponse?.posts) ? newsResponse.posts : []

  const {
    data: newsletterResponse,
    error: newsletterFetchError,
    isLoading: newslettersLoading,
  } = useSWR<{ campaigns?: NewsletterEdition[] }>("/api/newsletters?limit=50")
  const campaigns = Array.isArray(newsletterResponse?.campaigns)
    ? newsletterResponse.campaigns
    : []

  const loading = newsLoading || newslettersLoading
  const error = newsError
    ? "Failed to load news. Please try again later."
    : newsletterFetchError
      ? "Failed to load updates. Please try again later."
      : null

  const newsletterCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return campaigns
      .map(editionToCard)
      .filter((post) => {
        if (!q) return true
        const hay = `${post.title} ${post.excerpt ?? ""}`.toLowerCase()
        return hay.includes(q)
      })
  }, [campaigns, searchQuery])

  const feed = useMemo(() => {
    const articles =
      categoryId === NEWSLETTER_CATEGORY_ID || tagId ? [] : news
    const editions =
      !categoryId || categoryId === NEWSLETTER_CATEGORY_ID ? newsletterCards : []
    return [...articles, ...editions].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return Number(b.isPinned) - Number(a.isPinned)
      if (a.isFeatured !== b.isFeatured) return Number(b.isFeatured) - Number(a.isFeatured)
      return itemDate(b) - itemDate(a)
    })
  }, [news, newsletterCards, categoryId, tagId])

  useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  const applySearch = (value?: string) => {
    const q = (value ?? searchInput).trim()
    const params = new URLSearchParams(searchParams.toString())
    params.delete("tab")
    if (q) params.set("search", q)
    else params.delete("search")
    params.delete("page")
    router.replace(params.toString() ? `?${params.toString()}` : NEWS_HUB_PATH, { scroll: false })
  }

  const setCategoryFilter = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("tab")
    if (id) params.set("categoryId", id)
    else params.delete("categoryId")
    params.delete("tagId")
    router.replace(params.toString() ? `?${params.toString()}` : NEWS_HUB_PATH, { scroll: false })
  }

  const setTagFilter = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("tab")
    if (id) params.set("tagId", id)
    else params.delete("tagId")
    params.delete("categoryId")
    router.replace(params.toString() ? `?${params.toString()}` : NEWS_HUB_PATH, { scroll: false })
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
    router.replace(NEWS_HUB_PATH, { scroll: false })
  }

  const hasActiveFilters = searchQuery || categoryId || tagId
  const activeCategoryName =
    categoryId === NEWSLETTER_CATEGORY_ID
      ? NEWSLETTER_CATEGORY.name
      : categoryId &&
        (news.find((p) => p.category?.id === categoryId)?.category?.name ?? "Category")
  const activeTagName =
    tagId &&
    (news.find((p) => p.tags?.some((t) => t.tag.id === tagId))?.tags?.find((t) => t.tag.id === tagId)
      ?.tag.name ?? "Tag")

  const filterCount = [searchQuery, categoryId, tagId].filter(Boolean).length

  const showHierarchy = !hasActiveFilters && feed.length > 2
  const lead = showHierarchy ? feed[0] : null
  const afterLead = lead ? feed.filter((p) => p.id !== lead.id) : feed
  const secondary = showHierarchy ? afterLead.slice(0, 2) : []
  const secondaryIds = new Set(secondary.map((p) => p.id))
  const rest = showHierarchy ? afterLead.filter((p) => !secondaryIds.has(p.id)) : feed

  return (
    <DashboardLayout>
      <ListPageShell
        breadcrumb="News & Updates"
        title="News & updates"
        description="Stories, announcements, and newsletter editions from Impact Hub Nairobi."
        resultCount={feed.length}
        resultLabel="updates"
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
              placeholder="Search updates…"
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
                placeholder="Search updates…"
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
          uniqueCategories.length > 0 || uniqueTags.length > 0 ? (
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
        {hasActiveFilters ? (
          <div className="hidden flex-wrap items-center gap-2 md:flex">
            <span className="text-sm text-muted-foreground">Active:</span>
            {searchQuery ? (
              <Badge variant="secondary" className="font-normal">
                &quot;{searchQuery}&quot;
              </Badge>
            ) : null}
            {activeCategoryName ? <Badge variant="outline">{activeCategoryName}</Badge> : null}
            {activeTagName ? <Badge variant="outline">{activeTagName}</Badge> : null}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={clearFilters}
            >
              Clear all
            </Button>
            <span className="ml-auto text-sm text-muted-foreground">
              {loading ? "Loading…" : `${feed.length} update${feed.length === 1 ? "" : "s"}`}
            </span>
          </div>
        ) : (
          <p className="hidden text-sm text-muted-foreground md:block">
            {loading ? "Loading…" : `${feed.length} update${feed.length === 1 ? "" : "s"}`}
          </p>
        )}

        <ListPageBody
          loading={loading}
          loadingMessage="Loading updates…"
          error={error}
          errorAction={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
          isEmpty={feed.length === 0}
          empty={
            <EmptyState
              icon={Newspaper}
              title={hasActiveFilters ? "No updates match your filters" : "No updates yet"}
              description={
                hasActiveFilters
                  ? "Try clearing filters to see all published stories and newsletters."
                  : "Hub stories, announcements, and newsletter editions will appear here."
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
                      Latest updates
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
