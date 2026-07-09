"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users2, CheckCircle2, Sparkles, X, Plus } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
import {
  MobileStatsStrip,
  MobileBreadcrumbsHidden,
} from "@/components/mobile/mobile-page-shell"
import { useState, useEffect } from "react"
import useSWR from "swr"
import { WelcomeModal } from "@/components/welcome-modal"
import { DashboardSpaceWidget } from "@/components/dashboard-space-widget"
import {
  DashboardDeliveriesWidget,
  DashboardVisitorsWidget,
} from "@/components/dashboard-front-desk-widgets"
import { DashboardAnnouncements } from "@/components/dashboard-announcements"
import { useSession } from "@/lib/use-session"
import { toast } from "@/lib/toast"
import { MetricCard, MetricCardGrid } from "@/components/design/metric-card"
import {
  DataList,
  DataListRow,
  DataListPrimary,
  DataListMeta,
} from "@/components/design/data-list"
import { StatusDot } from "@/components/design/status-dot"
import { EmptyState } from "@/components/design/empty-state"
import { cn } from "@/lib/utils"
import {
  dismissGettingStarted,
  shouldShowGettingStarted,
} from "@/lib/getting-started"

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
  const eventsKey = user ? "/api/events?filter=upcoming&limit=5" : null
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
    if (onboardingComplete) {
      setShowGettingStarted(shouldShowGettingStarted(true))
    }
  }, [onboardingComplete])

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

  const dashboardFeedShell =
    "flex min-h-[14rem] flex-col overflow-hidden rounded-md border border-border bg-card md:min-h-0"
  const dashboardFeedLoading =
    "flex flex-1 items-center justify-center py-6 text-sm text-muted-foreground"
  const dashboardFeedEmpty =
    "flex flex-1 flex-col items-center justify-center border-0 bg-transparent px-4 py-6 shadow-none md:px-6 md:py-8"

  return (
    <>
      <WelcomeModal
        onboardingComplete={onboardingComplete ?? false}
        userName={user?.name}
        onWelcomeComplete={() => setShowGettingStarted(shouldShowGettingStarted(true))}
      />
      <div className="space-y-4 md:space-y-10">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs items={[{ label: "Dashboard" }]} />
        </MobileBreadcrumbsHidden>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-0.5">
            <h1 className="page-title">{greeting}, {userName}</h1>
            <p className="hidden text-sm text-muted-foreground sm:block md:text-base">
              Welcome back to Impact Hub Nairobi. Continue building your impact.
            </p>
          </div>
          <Button asChild size="sm" className="h-9 shrink-0 text-sm md:h-10">
            <Link href="/booking">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                  onClick={() => {
                    dismissGettingStarted()
                    setShowGettingStarted(false)
                  }}
                  aria-label="Dismiss getting started"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3 md:gap-4">
                <Link href="/booking" className="group">
                  <div className="rounded-md border border-border p-3 transition-colors hover:bg-muted/50 md:p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span className="font-medium">Book Your First Workspace</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Reserve a meeting room or collaboration space</p>
                  </div>
                </Link>
                <Link href="/community" className="group">
                  <div className="rounded-md border border-border p-3 transition-colors hover:bg-muted/50 md:p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">Explore the Community</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Connect with entrepreneurs and innovators</p>
                  </div>
                </Link>
                <Link href="/events" className="group">
                  <div className="rounded-md border border-border p-3 transition-colors hover:bg-muted/50 md:p-4">
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

        <div className="hidden md:block">
          <MetricCardGrid>
            <MetricCard
              label="Upcoming events"
              value={isLoadingStats ? "…" : statsWithDefaults.upcomingEvents}
              description="This week"
              icon={CalendarDays}
              href="/events"
            />
            <MetricCard
              label="Community members"
              value={isLoadingStats ? "…" : statsWithDefaults.activeMembers}
              description="Active on platform"
              icon={Users2}
              href="/community"
            />
            <MetricCard
              label="Your connections"
              value={isLoadingStats ? "…" : statsWithDefaults.userConnections}
              icon={CheckCircle2}
              href="/community?tab=connections"
            />
          </MetricCardGrid>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="section-label">Upcoming bookings</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/bookings">View all</Link>
              </Button>
            </div>
            {isLoadingBookings ? (
              <div className={dashboardFeedShell}>
                <div className={dashboardFeedLoading}>Loading bookings…</div>
              </div>
            ) : upcomingBookings.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No upcoming bookings"
                description="Reserve a desk or meeting room to work from the hub this week."
                action={
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/booking">Book a workspace</Link>
                  </Button>
                }
                className={cn(dashboardFeedShell, dashboardFeedEmpty)}
              />
            ) : (
              <DataList className={dashboardFeedShell}>
                {upcomingBookings.map((booking) => {
                  const display = formatBookingDisplay(booking)
                  return (
                    <DataListRow key={booking.id} href={`/dashboard/bookings/${booking.id}`}>
                      <DataListPrimary title={display.room} subtitle={display.time} />
                      <StatusDot
                        label={display.status}
                        variant={display.status === "Confirmed" ? "success" : "warning"}
                      />
                    </DataListRow>
                  )
                })}
              </DataList>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="section-label">Community highlights</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/events">View all</Link>
              </Button>
            </div>
            {isLoadingEvents ? (
              <div className={dashboardFeedShell}>
                <div className={dashboardFeedLoading}>Loading highlights…</div>
              </div>
            ) : recentEvents.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No upcoming events"
                description="Workshops and networking sessions are added regularly — check back soon."
                action={
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/events">Browse events</Link>
                  </Button>
                }
                className={cn(dashboardFeedShell, dashboardFeedEmpty)}
              />
            ) : (
              <DataList className={dashboardFeedShell}>
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
                    <DataListRow key={event.id} href={`/events/${event.id}`}>
                      <DataListPrimary
                        title={event.title}
                        subtitle={event.location || undefined}
                      />
                      <DataListMeta>{formattedDate}</DataListMeta>
                    </DataListRow>
                  )
                })}
              </DataList>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
