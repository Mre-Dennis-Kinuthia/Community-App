"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Users2, CheckCircle2, ArrowUpRight, ExternalLink, HelpCircle, Sparkles, X, Plus } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
import {
  MobileStatsStrip,
  MobileBreadcrumbsHidden,
} from "@/components/mobile/mobile-page-shell"
import { useState, useEffect } from "react"
import useSWR from "swr"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { WelcomeModal } from "@/components/welcome-modal"
import { DashboardSpaceWidget } from "@/components/dashboard-space-widget"
import {
  DashboardDeliveriesWidget,
  DashboardVisitorsWidget,
} from "@/components/dashboard-front-desk-widgets"
import { DashboardAnnouncements } from "@/components/dashboard-announcements"
import { useSession } from "@/lib/use-session"
import { toast } from "@/lib/toast"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

interface Booking {
  id: string
  resourceType: string
  date: string
  startTime: string
  endTime: string
  duration: string
  status: string
  totalPrice: number
}

interface DashboardStats {
  upcomingEvents: number
  activeMembers: number
  userConnections: number
  userEvents: number
}

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  location: string | null
}

export default function DashboardPage() {
  const { user } = useSession()
  const [greeting, setGreeting] = useState("Good morning")
  const [showGettingStarted, setShowGettingStarted] = useState(false)
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null)

  // Only show tutorial after onboarding is complete (or when user just completed onboarding)
  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    if (typeof window !== "undefined" && sessionStorage.getItem("onboardingJustCompleted") === "true") {
      setOnboardingComplete(true)
      return
    }
    fetch("/api/profile", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return
        if (data?.needsOnboarding === false) {
          setOnboardingComplete(true)
        } else if (typeof window !== "undefined" && sessionStorage.getItem("onboardingJustCompleted") === "true") {
          setOnboardingComplete(true)
        }
      })
      .catch(() => {
        if (typeof window !== "undefined" && sessionStorage.getItem("onboardingJustCompleted") === "true") {
          setOnboardingComplete(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const statsKey = user ? "/api/dashboard/stats" : null
  const eventsKey = user ? "/api/events?filter=upcoming&limit=2" : null
  const bookingsKey = user ? "/api/bookings/upcoming?limit=5&days=7" : null

  const { data: stats = null, isLoading: isLoadingStats } = useSWR<DashboardStats>(statsKey)
  const { data: eventsData, isLoading: isLoadingEvents } = useSWR<{ events?: Event[] }>(eventsKey)
  const { data: bookingsData, isLoading: isLoadingBookings } = useSWR<{ bookings?: Booking[] }>(bookingsKey)

  const statsWithDefaults: DashboardStats = stats ?? {
    upcomingEvents: 0,
    activeMembers: 0,
    userConnections: 0,
    userEvents: 0,
  }
  const recentEvents = Array.isArray(eventsData?.events) ? eventsData.events : []
  const upcomingBookings = Array.isArray(bookingsData?.bookings) ? bookingsData.bookings : []

  const getUserFirstName = () => {
    if (user?.name) return user.name.split(" ")[0]
    if (user?.email) return user.email.split("@")[0]
    return "there"
  }
  const userName = getUserFirstName()

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    if (params.get("notice") === "feature-unavailable") {
      toast.info(
        "Section unavailable",
        "That area is not open on the platform yet. Use the menu for available features."
      )
      window.history.replaceState({}, "", "/dashboard")
    }
  }, [])

  // Format booking display
  const formatBookingDisplay = (booking: Booking) => {
    const date = new Date(booking.date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    let dateLabel = ""
    if (date.toDateString() === today.toDateString()) {
      dateLabel = "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateLabel = "Tomorrow"
    } else {
      dateLabel = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    }

    const resourceName = (booking.resourceType ?? "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") || "Workspace"

    return {
      room: resourceName,
      time: `${dateLabel}, ${booking.startTime} - ${booking.endTime}`,
      status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
    }
  }

  return (
    <TooltipProvider>
      <WelcomeModal onboardingComplete={onboardingComplete ?? false} userName={user?.name} />
      <div className="space-y-6 md:space-y-10">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs items={[{ label: "Dashboard" }]} />
        </MobileBreadcrumbsHidden>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{greeting}, {userName}</h1>
            <p className="hidden text-sm text-muted-foreground sm:block md:text-base">
              Welcome back to Impact Hub Nairobi. Continue building your impact.
            </p>
          </div>
          <Button asChild className="shrink-0">
            <Link href="/booking">
              <Plus className="mr-2 h-4 w-4" />
              Book Workspace
            </Link>
          </Button>
        </div>

        <MobileStatsStrip
          loading={isLoadingStats}
          items={[
            { label: "Events", value: statsWithDefaults.upcomingEvents, icon: CalendarDays },
            { label: "Members", value: statsWithDefaults.activeMembers, icon: Users2 },
            { label: "Connections", value: statsWithDefaults.userConnections, icon: CheckCircle2 },
          ]}
        />

        <DashboardAnnouncements />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardSpaceWidget />
          <DashboardVisitorsWidget />
          <DashboardDeliveriesWidget />
        </div>

        {/* Getting Started Card for New Users */}
        {showGettingStarted && (
          <Card className="border border-border bg-muted/40">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>Three steps to get started on the member platform.</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowGettingStarted(false)}
                  aria-label="Dismiss getting started"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Link href="/booking" className="group">
                  <div className="rounded-md border border-border p-4 transition-colors hover:bg-muted/50">
                    <div className="mb-2 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span className="font-medium">Book Your First Workspace</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Reserve a meeting room or collaboration space</p>
                  </div>
                </Link>
                <Link href="/community" className="group">
                  <div className="rounded-md border border-border p-4 transition-colors hover:bg-muted/50">
                    <div className="mb-2 flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">Explore the Community</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Connect with entrepreneurs and innovators</p>
                  </div>
                </Link>
                <Link href="/events" className="group">
                  <div className="rounded-md border border-border p-4 transition-colors hover:bg-muted/50">
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">Join an Event</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Discover workshops and networking events</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-3">
          <Card 
            className="cursor-pointer transition-colors hover:bg-muted/30 focus-within:ring-2 focus-within:ring-ring" 
            onClick={() => window.location.href = "/profile"}
            role="button"
            tabIndex={0}
            aria-label="View community status and profile"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                window.location.href = "/profile"
              }
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Community Status</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Your current membership tier. Active members have full access to workspace, events, and community features.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">Fixed Desk Plan</p>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer transition-colors hover:bg-muted/30 focus-within:ring-2 focus-within:ring-ring" 
            onClick={() => window.location.href = "/events"}
            role="button"
            tabIndex={0}
            aria-label="View upcoming events"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                window.location.href = "/events"
              }
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold min-h-[2rem] flex items-center">
                {isLoadingStats ? (
                  <span className="text-muted-foreground animate-pulse">...</span>
                ) : (
                  <span className="transition-opacity duration-150 ease-out opacity-100">
                    {statsWithDefaults.upcomingEvents}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer transition-colors hover:bg-muted/30 focus-within:ring-2 focus-within:ring-ring" 
            onClick={() => window.location.href = "/community"}
            role="button"
            tabIndex={0}
            aria-label="View community directory"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                window.location.href = "/community"
              }
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Members</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold min-h-[2rem] flex items-center">
                {isLoadingStats ? (
                  <span className="text-muted-foreground animate-pulse">...</span>
                ) : (
                  <span className="transition-opacity duration-150 ease-out opacity-100">{statsWithDefaults.activeMembers}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Your scheduled space reservations for this week.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBookings ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">Loading bookings...</p>
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-8 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">No upcoming bookings</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/booking">Book a workspace</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => {
                    const display = formatBookingDisplay(booking)
                    return (
                      <div key={booking.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{display.room}</p>
                          <p className="text-xs text-muted-foreground">{display.time}</p>
                        </div>
                        <Badge variant={display.status === "Confirmed" ? "default" : "secondary"}>
                          {display.status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
                <Button variant="outline" className="mt-4 w-full bg-transparent" asChild>
                  <Link href="/booking">
                    View All Bookings
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Community Highlights</CardTitle>
            <CardDescription>Stay updated with what's happening.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingEvents ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground animate-pulse">Loading highlights...</p>
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">No upcoming events</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/events">View Events</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="transition-opacity duration-150 ease-out opacity-100">
                <div className="space-y-4">
                  {recentEvents.map((event) => {
                    const eventDate = new Date(event.startDate)
                    const formattedDate = eventDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                    return (
                      <Link key={event.id} href={`/events/${event.id}`} className="block">
                        <div className="flex gap-4 hover:opacity-80 transition-opacity duration-150">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
                            <CalendarDays className="h-5 w-5" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <p className="text-sm font-medium leading-none">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formattedDate}
                              {event.location && ` • ${event.location}`}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
                <Button className="mt-4 w-full" asChild>
                  <Link href="/events">
                    View All Events
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </TooltipProvider>
  )
}
