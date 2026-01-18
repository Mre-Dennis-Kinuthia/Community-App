"use client"

import { use, useState, useEffect } from "react"
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
  User
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-6 py-20">
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
      <div className="min-h-screen bg-background">
        {/* Medium-style Article */}
        <article className="max-w-3xl mx-auto px-6 py-12">
          {/* Back Button */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Article Header */}
          <header className="mb-12">
            <h1 
              className="text-5xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "Georgia, serif", lineHeight: "1.2" }}
            >
              {newsItem.title}
            </h1>
            
            {newsItem.excerpt && (
              <p 
                className="text-xl text-muted-foreground mb-6 italic"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {newsItem.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-b border-border/50 py-4">
              {newsItem.author && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>By {newsItem.author.name || newsItem.author.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(displayDate, "MMMM d, yyyy")}</span>
              </div>
              {newsItem.readingTimeMinutes && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{newsItem.readingTimeMinutes} min read</span>
                  </div>
                </>
              )}
              {newsItem.viewCount > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{newsItem.viewCount} {newsItem.viewCount === 1 ? 'view' : 'views'}</span>
                  </div>
                </>
              )}
            </div>

            {/* Category and Tags */}
            {(newsItem.category || newsItem.tags.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
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
            <div className="mb-12 -mx-6">
              <img
                src={newsItem.imageUrl}
                alt={newsItem.title}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          {/* Article Content - Medium Style */}
          <div 
            className="prose prose-lg max-w-none"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "21px",
              lineHeight: "1.8",
              color: "inherit",
            }}
          >
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: newsItem.content }}
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "21px",
                lineHeight: "1.8",
              }}
            />
          </div>

          {/* Article Footer */}
          <footer className="mt-16 pt-8 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => router.push("/news")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to News
              </Button>
            </div>
          </footer>

          {/* Comments Section */}
          <section className="mt-16 pt-8 border-t border-border/50">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2" style={{ fontFamily: "Georgia, serif" }}>
              <MessageSquare className="h-6 w-6" />
              Comments {comments.length > 0 && `(${comments.length})`}
            </h2>

            {/* Comment Form */}
            <div className="mb-12 p-6 border border-border/50 rounded-lg bg-background/50">
              <h3 className="text-lg font-semibold mb-4">Leave a Comment</h3>
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
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-8">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-border/50 pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{comment.authorName}</span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(comment.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                        
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
        </article>
      </div>

      {/* Medium-style Typography CSS */}
      <style jsx global>{`
        .article-content {
          font-family: Georgia, serif;
          font-size: 21px;
          line-height: 1.8;
          color: inherit;
        }
        
        .article-content p {
          margin-bottom: 1.5rem;
          font-size: 21px;
          line-height: 1.8;
        }
        
        .article-content h1,
        .article-content h2,
        .article-content h3 {
          font-family: Georgia, serif;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .article-content h1 {
          font-size: 2.5rem;
          line-height: 1.2;
        }
        
        .article-content h2 {
          font-size: 2rem;
          line-height: 1.3;
        }
        
        .article-content h3 {
          font-size: 1.5rem;
          line-height: 1.4;
        }
        
        .article-content img {
          max-width: 100%;
          height: auto;
          margin: 2rem 0;
          border-radius: 8px;
        }
        
        .article-content a {
          color: #2563eb;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        
        .article-content a:hover {
          color: #1d4ed8;
        }
        
        .article-content strong {
          font-weight: 700;
        }
        
        .article-content em {
          font-style: italic;
        }
        
        .article-content ul,
        .article-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        
        .article-content li {
          margin-bottom: 0.5rem;
          line-height: 1.8;
        }
        
        .article-content blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .article-content code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: 'Courier New', monospace;
        }
        
        .article-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        
        .article-content pre code {
          background: none;
          padding: 0;
        }
      `}</style>
    </DashboardLayout>
  )
}
