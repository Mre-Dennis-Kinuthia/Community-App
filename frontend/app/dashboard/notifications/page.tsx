"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, ArrowLeft, Loader2, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          <p className="text-muted-foreground text-sm">View and manage your notifications</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All notifications</CardTitle>
          <CardDescription>
            {notifications.filter((n) => !n.read).length} unread
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading...
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchNotifications}>
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleClick(notification)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        handleClick(notification)
                      }
                    }}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                      !notification.read && "bg-accent/50"
                    )}
                  >
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0 mt-2",
                        !notification.read ? getTypeDot(notification.type) : "bg-transparent"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{notification.title}</p>
                        {notification.category && (
                          <Badge variant="outline" className="text-xs">
                            {notification.category}
                          </Badge>
                        )}
                        {!notification.read && (
                          <Badge variant="secondary">Unread</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        disabled={markingId === notification.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                      >
                        {markingId === notification.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
