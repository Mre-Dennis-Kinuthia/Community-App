"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  Calendar,
  Newspaper,
  Loader2
} from "lucide-react"
import { format } from "date-fns"
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

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [newsItem, setNewsItem] = useState<NewsPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

    fetchNewsItem()
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

            <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-b border-border/50 py-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(displayDate, "MMMM d, yyyy")}</span>
              </div>
            </div>
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
