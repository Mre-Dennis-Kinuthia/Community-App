"use client"

import Link from "next/link"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => (r.ok ? r.json() : { announcements: [] }))

export function DashboardAnnouncements() {
  const { data, isLoading } = useSWR("/api/announcements", fetcher)
  const announcements = (data?.announcements || []) as Array<{
    id: string
    title: string
    excerpt: string | null
    announcementType: string
  }>

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
  if (announcements.length === 0) return null

  return (
    <div className="space-y-2">
      {announcements.map((post) => (
        <Card
          key={post.id}
          className={cn(
            post.announcementType === "urgent" && "border-destructive/50 bg-destructive/5",
            post.announcementType === "pinned" && "border-primary/40"
          )}
        >
          <CardContent className="flex items-start gap-3 p-4">
            <Megaphone className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/news/${post.id}`} className="font-medium hover:underline">
                  {post.title}
                </Link>
                {post.announcementType !== "normal" ? (
                  <Badge variant={post.announcementType === "urgent" ? "destructive" : "default"}>
                    {post.announcementType}
                  </Badge>
                ) : null}
              </div>
              {post.excerpt ? (
                <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
