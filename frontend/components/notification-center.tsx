"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bell, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"

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

function NotificationBellButton({
  unreadCount,
  ...props
}: React.ComponentProps<typeof Button> & { unreadCount: number }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-10 w-10 min-h-[44px] min-w-[44px] transition-colors duration-200 ease-out hover:bg-muted/60"
      {...props}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center p-0 text-[10px]"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
      <span className="sr-only">Notifications</span>
    </Button>
  )
}

function NotificationListBody({
  notifications,
  isLoading,
  unreadCount,
  onItemClick,
  onDelete,
  onMarkAllRead,
}: {
  notifications: Notification[]
  isLoading: boolean
  unreadCount: number
  onItemClick: (n: Notification) => void
  onDelete: (id: string) => void
  onMarkAllRead: () => void
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-border px-1 py-2">
        <p className="text-sm font-medium">Notifications</p>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="h-8 shrink-0 text-xs" onClick={onMarkAllRead}>
            Mark all read
          </Button>
        )}
      </div>
      <div className="max-h-[min(60vh,400px)] overflow-y-auto overscroll-contain">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((notification) => (
              <li key={notification.id} className="relative">
                <button
                  type="button"
                  className={cn(
                    "flex w-full flex-col gap-1 p-3 pr-12 text-left transition-colors",
                    !notification.read && "bg-accent/50"
                  )}
                  onClick={() => onItemClick(notification)}
                >
                  <div className="flex min-w-0 items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-medium leading-snug">{notification.title}</p>
                        {notification.category ? (
                          <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px]">
                            {notification.category}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <span
                        className={cn(
                          "mt-1 h-2 w-2 shrink-0 rounded-full",
                          notification.type === "error" && "bg-destructive",
                          notification.type === "warning" && "bg-yellow-500",
                          notification.type === "success" && "bg-green-500",
                          notification.type === "info" && "bg-primary"
                        )}
                        aria-hidden
                      />
                    )}
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-2 h-8 w-8 opacity-100 md:opacity-70"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(notification.id)
                  }}
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {notifications.length > 0 && (
        <div className="border-t border-border pt-2">
          <Button variant="ghost" className="h-10 w-full text-sm text-primary" asChild>
            <Link href="/dashboard/notifications">View all notifications</Link>
          </Button>
        </div>
      )}
    </>
  )
}

export function NotificationCenter() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
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
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!open) return
    async function refresh() {
      try {
        const response = await fetch("/api/notifications?limit=10", { credentials: "include" })
        if (!response.ok) return
        const data = await response.json()
        const list = data.notifications || []
        setNotifications(list)
        setUnreadCount(
          typeof data.unreadCount === "number"
            ? data.unreadCount
            : list.filter((n: Notification) => !n.read).length
        )
      } catch {
        // ignore
      }
    }
    refresh()
  }, [open])

  const markAsRead = async (id: string) => {
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
        setNotifications(
          notifications.map((n) => (n.id === id ? { ...n, read: false, readAt: null } : n))
        )
        setUnreadCount(unreadCount + 1)
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: false, readAt: null } : n))
      )
      setUnreadCount(unreadCount + 1)
    }
  }

  const markAllAsRead = async () => {
    const previousNotifications = [...notifications]
    setNotifications(notifications.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() })))
    setUnreadCount(0)

    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        setNotifications(previousNotifications)
        setUnreadCount(previousNotifications.filter((n) => !n.read).length)
      } else {
        const refreshResponse = await fetch("/api/notifications?limit=10", { credentials: "include" })
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      }
    } catch (error) {
      console.error("Error marking all as read:", error)
      setNotifications(previousNotifications)
      setUnreadCount(previousNotifications.filter((n) => !n.read).length)
    }
  }

  const deleteNotification = async (id: string) => {
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
        setNotifications(previousNotifications)
        if (notification && !notification.read) {
          setUnreadCount(unreadCount + 1)
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      setNotifications(previousNotifications)
      if (notification && !notification.read) {
        setUnreadCount(unreadCount + 1)
      }
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    setOpen(false)
    if (notification.actionUrl) {
      const url = notification.actionUrl
      if (url.startsWith("http://") || url.startsWith("https://")) {
        window.location.href = url
      } else {
        router.push(url)
      }
    }
  }

  const listProps = {
    notifications,
    isLoading,
    unreadCount,
    onItemClick: handleNotificationClick,
    onDelete: deleteNotification,
    onMarkAllRead: markAllAsRead,
  }

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <NotificationBellButton unreadCount={unreadCount} />
        </SheetTrigger>
        <SheetContent side="bottom" className="flex max-h-[85vh] flex-col rounded-t-2xl px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
          <SheetHeader className="sr-only">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <NotificationListBody {...listProps} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <NotificationBellButton unreadCount={unreadCount} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(20rem,calc(100vw-1.5rem))] p-0"
        sideOffset={8}
      >
        <div className="p-2">
          <NotificationListBody {...listProps} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
