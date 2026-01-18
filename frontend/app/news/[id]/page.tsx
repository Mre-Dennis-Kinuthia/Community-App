"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  Calendar,
  Newspaper,
  Loader2
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { format } from "date-fns"

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
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: "News & Updates", href: "/news" }, { label: "Loading..." }]} />
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !newsItem) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: "News & Updates", href: "/news" }, { label: "Not Found" }]} />
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4 text-center">
                {error || "News item not found"}
              </p>
              <Button onClick={() => router.push("/news")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to News
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const displayDate = getDisplayDate(newsItem)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "News & Updates", href: "/news" }, { label: newsItem.title }]} />
        
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              {newsItem.imageUrl && (
                <div className="relative h-64 w-full overflow-hidden rounded-t-lg">
                  <img
                    src={newsItem.imageUrl}
                    alt={newsItem.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-3xl">{newsItem.title}</CardTitle>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(displayDate, "MMMM d, yyyy")}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {newsItem.excerpt && (
                  <p className="text-lg text-muted-foreground font-medium italic">
                    {newsItem.excerpt}
                  </p>
                )}
                <div className="prose prose-lg max-w-none">
                  <div className="text-foreground leading-relaxed text-base whitespace-pre-wrap">
                    {newsItem.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-border/50 sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Article Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Published</p>
                  <p className="font-medium">{format(displayDate, "MMMM d, yyyy")}</p>
                </div>
                {newsItem.excerpt && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Summary</p>
                    <p className="text-sm">{newsItem.excerpt}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
