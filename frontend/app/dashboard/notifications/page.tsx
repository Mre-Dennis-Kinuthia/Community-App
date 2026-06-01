"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { MobilePageHeader } from "@/components/mobile/mobile-page-shell"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  readAt: string | null
  createdAt: string
  actionUrl?: string | null
  category?: string | null
}

export default function DashboardNotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingId, setMarkingId] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/notifications?limit=50", { credentials: "include" })
      if (!response.ok) {
        throw new Error("Failed to load notifications")
      }
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (err) {
      setError("Failed to load notifications. Please try again.")
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = async (id: string) => {
    setMarkingId(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
    )
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
        credentials: "include",
      })
      if (!response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: false, readAt: null } : n))
        )
      }
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false, readAt: null } : n))
      )
    } finally {
      setMarkingId(null)
    }
  }

  const handleClick = (notification: Notification) => {
    if (!notification.read) markAsRead(notification.id)
    if (notification.actionUrl) {
      const url = notification.actionUrl
      if (url.startsWith("http://") || url.startsWith("https://")) {
        window.location.href = url
      } else {
        router.push(url)
      }
    }
  }

  const getTypeDot = (type: string) => {
    switch (type) {
      case "error":
        return "bg-destructive"
      case "warning":
        return "bg-yellow-500"
      case "success":
        return "bg-green-500"
      default:
        return "bg-primary"
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-start gap-2">
        <Button variant="ghost" size="icon" className="shrink-0 mt-0.5" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <MobilePageHeader
          title="Notifications"
          description={`${notifications.filter((n) => !n.read).length} unread`}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border py-8 text-center">
          <p className="mb-2 text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchNotifications}>
            Retry
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 py-12 text-center text-muted-foreground">
          No notifications yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <button
                type="button"
                onClick={() => handleClick(notification)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border border-border/80 p-3.5 text-left transition-colors hover:bg-muted/30",
                  !notification.read && "bg-primary/5 border-primary/20"
                )}
              >
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", getTypeDot(notification.type))} />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium leading-snug", !notification.read && "text-foreground")}>
                    {notification.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    disabled={markingId === notification.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      markAsRead(notification.id)
                    }}
                    aria-label="Mark as read"
                  >
                    {markingId === notification.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
