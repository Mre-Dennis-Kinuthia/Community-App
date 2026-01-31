"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bell, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

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

export function NotificationCenter() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/notifications?limit=10", { credentials: "include" })
        if (response.ok) {
          const data = await response.json()
          const list = data.notifications || []
          setNotifications(list)
          // Use API unread count when present; otherwise derive from fetched list
          const count =
            typeof data.unreadCount === "number"
              ? data.unreadCount
              : list.filter((n: Notification) => !n.read).length
          setUnreadCount(count)
        } else {
          setNotifications([])
          setUnreadCount(0)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
        setNotifications([])
        setUnreadCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
    )
    setUnreadCount(Math.max(0, unreadCount - 1))

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
        credentials: "include",
      })

      if (!response.ok) {
        // Revert on error
        const data = await response.json()
        setNotifications(
          notifications.map((n) => (n.id === id ? { ...n, read: false, readAt: null } : n))
        )
        setUnreadCount(unreadCount + 1)
        console.error("Failed to mark notification as read:", data.error)
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
      // Revert on error
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: false, readAt: null } : n))
      )
      setUnreadCount(unreadCount + 1)
    }
  }

  const markAllAsRead = async () => {
    // Optimistic update
    const previousNotifications = [...notifications]
    setNotifications(notifications.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })))
    setUnreadCount(0)

    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        // Revert on error
        setNotifications(previousNotifications)
        setUnreadCount(previousNotifications.filter((n) => !n.read).length)
        const data = await response.json()
        console.error("Failed to mark all as read:", data.error)
      } else {
        // Refresh to get updated data
        const refreshResponse = await fetch("/api/notifications?limit=10", { credentials: "include" })
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      }
    } catch (error) {
      console.error("Error marking all as read:", error)
      // Revert on error
      setNotifications(previousNotifications)
      setUnreadCount(previousNotifications.filter((n) => !n.read).length)
    }
  }

  const deleteNotification = async (id: string) => {
    // Optimistic update
    const previousNotifications = [...notifications]
    const notification = notifications.find((n) => n.id === id)
    setNotifications(notifications.filter((n) => n.id !== id))
    if (notification && !notification.read) {
      setUnreadCount(Math.max(0, unreadCount - 1))
    }

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        // Revert on error
        setNotifications(previousNotifications)
        if (notification && !notification.read) {
          setUnreadCount(unreadCount + 1)
        }
        const data = await response.json()
        console.error("Failed to delete notification:", data.error)
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      // Revert on error
      setNotifications(previousNotifications)
      if (notification && !notification.read) {
        setUnreadCount(unreadCount + 1)
      }
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.actionUrl) {
      const url = notification.actionUrl
      if (url.startsWith("http://") || url.startsWith("https://")) {
        window.location.href = url
      } else {
        router.push(url)
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="relative group">
                <DropdownMenuItem
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                    !notification.read && "bg-accent"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between w-full gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        {notification.category && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {notification.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className={cn(
                        "h-2 w-2 rounded-full shrink-0 mt-1",
                        notification.type === "error" && "bg-destructive",
                        notification.type === "warning" && "bg-yellow-500",
                        notification.type === "success" && "bg-green-500",
                        notification.type === "info" && "bg-primary"
                      )} />
                    )}
                  </div>
                </DropdownMenuItem>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(notification.id)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/notifications" className="text-center text-sm text-primary block w-full py-2">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

