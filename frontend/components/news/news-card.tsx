"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Clock, Pin, Star } from "lucide-react"
import { ImpactHubMark } from "@/components/brand/impact-hub-mark"
import { cn } from "@/lib/utils"

export interface NewsCardTag {
  id: string
  name: string
  slug: string
}

export interface NewsCardCategory {
  id: string
  name: string
  slug: string
  color: string | null
}

export interface NewsCardPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  imageUrl: string | null
  publishedAt: Date | string | null
  createdAt: Date | string
  isFeatured: boolean
  isPinned: boolean
  viewCount: number
  readingTimeMinutes: number | null
  author: { id: string; name: string | null; email: string } | null
  category: NewsCardCategory | null
  tags: { tag: NewsCardTag }[]
}

export type NewsCardVariant = "hero" | "featured" | "standard"

/* IHN duotone gradients for posts without a cover image. */
const COVER_GRADIENTS = [
  "linear-gradient(135deg, #822929 0%, #1c395c 100%)",
  "linear-gradient(135deg, #1c395c 0%, #41bed0 110%)",
  "linear-gradient(135deg, #0a1f38 0%, #822929 110%)",
  "linear-gradient(135deg, #7ebb55 -10%, #1c395c 90%)",
] as const

function coverGradient(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return COVER_GRADIENTS[h % COVER_GRADIENTS.length]
}

function displayDate(post: NewsCardPost): Date {
  return new Date(post.publishedAt ?? post.createdAt)
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").substring(0, 220)
}

/** Branded artwork for posts without a cover image. */
function BrandedCover({
  post,
  className,
}: {
  post: NewsCardPost
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{ background: coverGradient(post.id || post.title) }}
    >
      <ImpactHubMark
        size={160}
        className="absolute -bottom-8 -right-8 opacity-[0.14] brightness-0 invert"
        title=""
      />
      <span className="absolute left-4 top-4 h-1 w-10 rounded-full bg-[#ffd546]/90" />
      {post.category ? (
        <span className="absolute bottom-4 left-4 text-xs font-medium uppercase tracking-[0.16em] text-white/80">
          {post.category.name}
        </span>
      ) : null}
    </div>
  )
}

function CategoryPill({
  category,
  className,
}: {
  category: NewsCardCategory
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-[#0a1f38]/75 px-2.5 py-1",
        "text-[11px] font-semibold text-white backdrop-blur-sm",
        className
      )}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: category.color || "#ffd546" }}
      />
      {category.name}
    </span>
  )
}

function StatusChips({ post }: { post: NewsCardPost }) {
  if (!post.isPinned && !post.isFeatured) return null
  return (
    <span className="flex gap-1.5">
      {post.isPinned ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
          <Pin className="h-3 w-3" />
          Pinned
        </span>
      ) : null}
      {post.isFeatured ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#ffd546] px-2.5 py-1 text-[11px] font-semibold text-[#0a1f38] shadow-sm">
          <Star className="h-3 w-3" />
          Featured
        </span>
      ) : null}
    </span>
  )
}

function Media({
  post,
  aspectClass,
}: {
  post: NewsCardPost
  aspectClass: string
}) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", aspectClass)}>
      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      ) : (
        <BrandedCover post={post} />
      )}
    </div>
  )
}

function MetaRow({
  post,
  className,
}: {
  post: NewsCardPost
  className?: string
}) {
  const tag = post.tags?.[0]?.tag
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
        className
      )}
    >
      <span>{format(displayDate(post), "MMM d, yyyy")}</span>
      {post.readingTimeMinutes ? (
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 shrink-0" />
          {post.readingTimeMinutes} min read
        </span>
      ) : null}
      {tag ? <span className="text-primary/80">#{tag.name}</span> : null}
    </div>
  )
}

export function NewsCard({
  post,
  variant = "standard",
  className,
}: {
  post: NewsCardPost
  variant?: NewsCardVariant
  className?: string
}) {
  const href = `/news/${post.id}`
  const preview = post.excerpt || stripHtml(post.content)

  if (variant === "hero") {
    return (
      <Link
        href={href}
        className={cn(
          "group relative block overflow-hidden rounded-xl border border-border",
          "transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(10,31,56,0.18)]",
          className
        )}
      >
        <div className="relative aspect-[16/9] bg-muted md:aspect-[21/9]">
          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <BrandedCover post={post} />
          )}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(0deg, rgba(10,31,56,0.92) 0%, rgba(10,31,56,0.45) 40%, transparent 68%)",
            }}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {post.category ? <CategoryPill category={post.category} /> : null}
            <StatusChips post={post} />
          </div>
          <h2 className="max-w-3xl text-xl font-bold leading-tight tracking-tight text-white md:text-3xl">
            {post.title}
          </h2>
          {preview ? (
            <p className="mt-2 hidden max-w-2xl text-sm text-white/75 md:line-clamp-1 md:block">
              {preview}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/65">
            <span>{format(displayDate(post), "MMMM d, yyyy")}</span>
            {post.readingTimeMinutes ? (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                {post.readingTimeMinutes} min read
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "featured") {
    return (
      <Link
        href={href}
        className={cn(
          "group block overflow-hidden rounded-xl border border-border bg-card",
          "transition-all duration-300 hover:border-primary/25 hover:shadow-[0_4px_20px_rgba(10,31,56,0.1)]",
          className
        )}
      >
        <div className="relative">
          <Media post={post} aspectClass="aspect-[16/9]" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {post.category ? <CategoryPill category={post.category} /> : null}
            <StatusChips post={post} />
          </div>
        </div>
        <div className="p-4 md:p-5">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          {preview ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {preview}
            </p>
          ) : null}
          <MetaRow post={post} className="mt-3" />
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card",
        "transition-all duration-300 hover:border-primary/25 hover:shadow-[0_4px_20px_rgba(10,31,56,0.08)]",
        className
      )}
    >
      <div className="relative">
        <Media post={post} aspectClass="aspect-[16/10]" />
        {post.category ? (
          <CategoryPill category={post.category} className="absolute bottom-3 left-3" />
        ) : null}
        {(post.isPinned || post.isFeatured) && (
          <div className="absolute left-3 top-3">
            <StatusChips post={post} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary md:text-base">
          {post.title}
        </h3>
        {preview ? (
          <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
            {preview}
          </p>
        ) : null}
        <MetaRow post={post} className="mt-auto pt-3" />
      </div>
    </Link>
  )
}
