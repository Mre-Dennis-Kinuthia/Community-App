"use client"

import { use, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Calendar,
  Newspaper,
  Loader2,
  Clock,
  Eye,
  Tag,
  MessageSquare,
  User,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NewsArticleContent } from "@/components/news/news-article-content"

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

interface Comment {
  id: string
  authorName: string
  authorEmail: string | null
  content: string
  createdAt: Date
  replies?: Comment[]
}

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [newsItem, setNewsItem] = useState<NewsPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentForm, setCommentForm] = useState({ authorName: "", authorEmail: "", content: "" })
  const [submittingComment, setSubmittingComment] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const onScroll = useCallback(() => {
    const winScroll = document.documentElement.scrollTop
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
    setScrollProgress(height > 0 ? (winScroll / height) * 100 : 0)
  }, [])

  useEffect(() => {
    async function fetchNewsItem() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/news/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError("News post not found")
          } else {
            throw new Error("Failed to fetch news post")
          }
          return
        }
        const data = await response.json()
        setNewsItem(data.post)
      } catch (err) {
        console.error("Error fetching news item:", err)
        setError("Failed to load news post. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    async function fetchComments() {
      try {
        const response = await fetch(`/api/news/${id}/comments`)
        if (response.ok) {
          const data = await response.json()
          setComments(data.comments || [])
        }
      } catch (err) {
        console.error("Error fetching comments:", err)
      }
    }

    fetchNewsItem()
    fetchComments()
  }, [id])

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [onScroll])

  const getDisplayDate = (item: NewsPost) => {
    if (item.publishedAt) {
      return new Date(item.publishedAt)
    }
    return new Date(item.createdAt)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !newsItem) {
    return (
      <DashboardLayout>
        <div className="min-h-[100svh] bg-background">
          <div className="max-w-4xl mx-auto px-4 py-12 md:px-6 md:py-20">
            <div className="text-center">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4 text-lg">
                {error || "News item not found"}
              </p>
              <Button onClick={() => router.push("/news")} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to News
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const displayDate = getDisplayDate(newsItem)

  return (
    <DashboardLayout>
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-primary/20"
        aria-hidden
      >
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="news-article-canvas min-h-[100svh] pb-10">
        <article className="news-article-panel">
          <div className="news-article-shell px-4 py-5 md:px-0 md:py-0">
          <div className="mb-4 hidden md:block">
            <Breadcrumbs
              items={[
                { label: "News & Updates", href: "/news" },
                { label: newsItem.title },
              ]}
            />
          </div>
          {/* Back Button */}
          <div className="mb-5 md:mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="group text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
              Back
            </Button>
          </div>

          {/* Article Header */}
          <header className="mb-8 md:mb-10">
            <h1 className="news-article-title mb-3">{newsItem.title}</h1>

            {newsItem.excerpt && (
              <p className="news-article-deck mb-5">{newsItem.excerpt}</p>
            )}

            {/* Meta Information */}
            <div className="news-article-meta flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-border py-3">
              {newsItem.author && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span>By {newsItem.author.name || newsItem.author.email}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{format(displayDate, "MMMM d, yyyy")}</span>
              </div>
              {newsItem.readingTimeMinutes && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{newsItem.readingTimeMinutes} min read</span>
                </div>
              )}
              {newsItem.viewCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {newsItem.viewCount} {newsItem.viewCount === 1 ? "view" : "views"}
                  </span>
                </div>
              )}
            </div>

            {/* Category and Tags */}
            {(newsItem.category || newsItem.tags.length > 0) && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {newsItem.category && (
                  <Link href={`/news?categoryId=${newsItem.category.id}`}>
                    <Badge
                      variant="outline"
                      style={newsItem.category.color ? { borderColor: newsItem.category.color, color: newsItem.category.color } : undefined}
                    >
                      {newsItem.category.name}
                    </Badge>
                  </Link>
                )}
                {newsItem.tags.map((postTag) => (
                  <Link key={postTag.tag.id} href={`/news?tagId=${postTag.tag.id}`}>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {postTag.tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {newsItem.imageUrl && (
            <div className="news-article-featured-image">
              <img
                src={newsItem.imageUrl}
                alt={newsItem.title}
                className="h-auto w-full"
              />
            </div>
          )}

          <NewsArticleContent html={newsItem.content} />

          {/* Article Footer */}
          <footer className="mt-10 border-t border-border pt-6 md:mt-14 md:pt-8">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => router.push("/news")}
                className="text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-200 ease-out" />
                Back to News
              </Button>
            </div>
          </footer>

          {/* Comments Section */}
          <section className="mt-10 border-t border-border pt-6 md:mt-14 md:pt-8">
            <h2 className="news-section-title mb-5 flex items-center gap-2 md:mb-6">
              <MessageSquare className="h-4 w-4 shrink-0" />
              Comments {comments.length > 0 && `(${comments.length})`}
            </h2>

            {/* Comment Form */}
            <div className="news-comments-panel mb-8 md:mb-10">
              <h3 className="mb-3 text-sm font-semibold md:text-base">Leave a comment</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!commentForm.content || !commentForm.authorName) return

                  setSubmittingComment(true)
                  try {
                    const response = await fetch(`/api/news/${id}/comments`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(commentForm),
                    })

                    if (response.ok) {
                      const data = await response.json()
                      setComments([data.comment, ...comments])
                      setCommentForm({ authorName: "", authorEmail: "", content: "" })
                    }
                  } catch (err) {
                    console.error("Error submitting comment:", err)
                  } finally {
                    setSubmittingComment(false)
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Your name *"
                    value={commentForm.authorName}
                    onChange={(e) => setCommentForm({ ...commentForm, authorName: e.target.value })}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Your email (optional)"
                    value={commentForm.authorEmail}
                    onChange={(e) => setCommentForm({ ...commentForm, authorEmail: e.target.value })}
                  />
                </div>
                <Textarea
                  placeholder="Your comment *"
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  rows={4}
                  required
                />
                <Button type="submit" disabled={submittingComment}>
                  {submittingComment ? "Submitting..." : "Submit Comment"}
                </Button>
              </form>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-border pb-5 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 md:h-9 md:w-9">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-sm font-semibold">{comment.authorName}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.createdAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap md:text-[0.9375rem]">
                          {comment.content}
                        </p>
                        
                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 ml-6 space-y-4 border-l-2 border-border/30 pl-6">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="border-b border-border/30 pb-4 last:border-0">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-sm">{reply.authorName}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(reply.createdAt), "MMM d, yyyy")}
                                      </span>
                                    </div>
                                    <p className="text-sm text-foreground whitespace-pre-wrap">{reply.content}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          </div>
        </article>
      </div>
    </DashboardLayout>
  )
}
