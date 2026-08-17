"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface LandingNewsTeaser {
  id: string
  slug: string | null
  title: string
  excerpt: string | null
  imageUrl: string | null
  publishedAt: string | null
  categoryName: string | null
}

function articlePath(post: LandingNewsTeaser): string {
  return `/news/${post.slug || post.id}`
}

function teaserText(post: LandingNewsTeaser): string {
  if (post.excerpt?.trim()) return post.excerpt.trim()
  if (post.categoryName) return `From ${post.categoryName} on Impact Hub Nairobi.`
  return "Read the latest from our impact community on the platform."
}

export function LandingImpactStories() {
  const [posts, setPosts] = useState<LandingNewsTeaser[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch("/api/landing/news?limit=3")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { posts?: LandingNewsTeaser[] } | null) => {
        if (!cancelled) {
          setPosts(data?.posts ?? [])
          setLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!loaded || posts.length === 0) return null

  return (
    <section className="landing-section">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label mb-3">Impact stories</p>
          <h2 className="section-title text-balance">Stories from Nairobi</h2>
          <p className="section-lead mx-auto mt-4 max-w-2xl text-pretty">
            Real ventures, programs, and partnerships from our community platform.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="landing-panel flex flex-col rounded-md border border-[#edeff2] bg-white p-6"
            >
              <BookOpen className="mb-4 h-5 w-5 text-[#812926]" aria-hidden />
              <h3 className="text-base font-semibold text-[#0a1f38]">{post.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1c395c]/80">
                {teaserText(post)}
              </p>
              <Link
                href={articlePath(post)}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#812926] hover:underline"
              >
                Read article
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/news">
            <Button variant="outline" className="border-[#1c395c]/20 bg-white hover:bg-[#faf9f6]">
              Browse all articles
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
