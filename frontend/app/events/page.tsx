"use client"

import { useState, useMemo, useEffect } from "react"
import useSWR from "swr"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Loader2, CalendarDays } from "lucide-react"
import { EventsHeader } from "@/components/events/events-header"
import { EventsTimeline } from "@/components/events/events-timeline"
import { EventDetailSheet } from "@/components/events/event-detail-sheet"
import { FilterBar, FilterBarItem } from "@/components/design/filter-bar"
import { MetricCard, MetricCardGrid } from "@/components/design/metric-card"
import {
  DataList,
  DataListRow,
  DataListPrimary,
  DataListMeta,
} from "@/components/design/data-list"
import { StatusDot } from "@/components/design/status-dot"
import { EmptyState } from "@/components/design/empty-state"
import { FilterChip } from "@/components/mobile/filter-chip"
import { FilterChipRow } from "@/components/mobile/filter-chip-row"
import { MobileSearchBar } from "@/components/mobile/mobile-search-bar"
import { MobileFilterSheet } from "@/components/mobile/mobile-filter-sheet"
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns"
import { useSession } from "@/lib/use-session"
import { toast } from "@/lib/toast"
import {
  displayLocation,
  eventTypeLabel,
  resolveEventPlatform,
  listPlatformFilterOptions,
} from "@/lib/event-constants"
import { formatEventPrice, isPaidEvent, parseRegistrationQuestions } from "@/lib/event-questions"
import { eventCalendarDate, formatEventTime24 } from "@/lib/event-datetime"
import { EventRegistrationDialog } from "@/components/events/event-registration-dialog"
import { autoImportFromRegistrationResponse } from "@/lib/event-calendar-client"

interface Event {
  id: number | string
  title: string
  type: string
  category: string
  time: string
  endTime?: string
  organizer: string
  platform: string
  platformId: string
  platformIcon: string
  status: string
  thumbnail?: string
  date: Date
  capacity?: number
  registered?: number
  waitlistCount?: number
  waitlistEnabled?: boolean
  registrationDeadline?: Date
  description?: string
  location?: string
  tags?: string[]
  price?: number | null
  currency?: string | null
  priceLabel?: string | null
  registrationQuestions?: unknown
  registrationProvider?: string | null
  lumaEventUrl?: string | null
  slug?: string
  shortCode?: string
}

export default function EventsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useSession()

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">(
    (searchParams.get("tab") as "upcoming" | "past") || "upcoming"
  )
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get("type") || "all")
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "all")
  const [organizerFilter, setOrganizerFilter] = useState<string>(searchParams.get("organizer") || "all")
  const [platformFilter, setPlatformFilter] = useState<string>(searchParams.get("platform") || "all")
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "date")
  const [dateRangeFilter, setDateRangeFilter] = useState<string>(searchParams.get("dateRange") || "all")
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [registering, setRegistering] = useState<Record<string | number, boolean>>({})
  const [isFiltering, setIsFiltering] = useState(false)
  const [regDialogOpen, setRegDialogOpen] = useState(false)
  const [pendingRegistration, setPendingRegistration] = useState<Event | null>(null)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const filter = activeTab === "upcoming" ? "upcoming" : "past"
  const eventsKey = `/api/events?filter=${filter}&limit=100&${searchQuery ? `search=${encodeURIComponent(searchQuery)}` : ""}`
  const { data: eventsData, error: eventsError, isLoading: loading, mutate: mutateEvents } =
    useSWR<{ events?: any[] }>(eventsKey)

  const allEvents: Event[] = useMemo(() => {
    const raw = Array.isArray(eventsData?.events) ? eventsData.events : []
    return raw.map((event: any) => {
      const tz = event.timezone || "Africa/Nairobi"
      const startDate = eventCalendarDate(event.startDate, tz)
      const endDate = event.endDate ? eventCalendarDate(event.endDate, tz) : null
      const registeredCount = event.confirmedCount ?? event._count?.registrations ?? 0
      const waitlistCount = event.waitlistCount ?? 0
      const isFull = event.capacity != null && registeredCount >= event.capacity
      const priceLabel = formatEventPrice(event.price, event.currency)

      const userStatus = event.userRegistrationStatus as string | undefined

      let status = "Open"
      if (userStatus === "registered" || userStatus === "attended") status = "Registered"
      else if (userStatus === "waitlisted") status = "Waitlisted"
      else if (userStatus === "pending") status = "Pending"
      else if (isFull && !event.waitlistEnabled) status = "Full"

      return {
        id: event.id,
        title: event.title,
        type: event.eventType || "other",
        category: event.eventType || "general",
        time: formatEventTime24(event.startDate, tz),
        endTime: event.endDate ? formatEventTime24(event.endDate, tz) : undefined,
        timezone: tz,
        organizer: event.organizerName || "Impact Hub Nairobi",
        ...(() => {
          const p = resolveEventPlatform({
            locationType: event.locationType,
            onlineUrl: event.onlineUrl,
            location: event.location,
          })
          return { platform: p.label, platformId: p.id, platformIcon: p.icon }
        })(),
        status,
        thumbnail: event.imageUrl,
        date: startDate,
        capacity: event.capacity,
        registered: registeredCount,
        waitlistCount,
        description: event.description,
        location: displayLocation(event),
        tags: event.tags || [],
        registrationRequired: event.registrationRequired !== false,
        waitlistEnabled: Boolean(event.waitlistEnabled),
        price: event.price,
        currency: event.currency,
        priceLabel,
        registrationQuestions: event.registrationQuestions,
        registrationProvider: event.registrationProvider || "platform",
        lumaEventUrl: event.lumaEventUrl || null,
        slug: event.slug,
        shortCode: event.shortCode,
      }
    })
  }, [eventsData])

  // Update URL params when filters change
  useEffect(() => {
    setIsFiltering(true)
    const params = new URLSearchParams()
    if (activeTab) params.set("tab", activeTab)
    if (searchQuery) params.set("search", searchQuery)
    if (typeFilter !== "all") params.set("type", typeFilter)
    if (statusFilter !== "all") params.set("status", statusFilter)
    if (organizerFilter !== "all") params.set("organizer", organizerFilter)
    if (platformFilter !== "all") params.set("platform", platformFilter)
    if (sortBy !== "date") params.set("sort", sortBy)
    if (dateRangeFilter !== "all") params.set("dateRange", dateRangeFilter)

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
    requestAnimationFrame(() => setIsFiltering(false))
  }, [activeTab, searchQuery, typeFilter, statusFilter, organizerFilter, platformFilter, sortBy, dateRangeFilter, router])

  // Get events based on active tab (already filtered by API, but double-check client-side)
  const baseEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return activeTab === "past"
      ? allEvents.filter((e) => e.date < today)
      : allEvents.filter((e) => e.date >= today)
  }, [activeTab, allEvents])

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = baseEvents.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) || false)

      const matchesType = typeFilter === "all" || event.type === typeFilter
      const matchesStatus = statusFilter === "all" || event.status === statusFilter
      const matchesOrganizer = organizerFilter === "all" || event.organizer === organizerFilter
      const matchesPlatform = platformFilter === "all" || event.platformId === platformFilter

      // Date range filter
      let matchesDateRange = true
      if (dateRangeFilter === "thisWeek" && activeTab === "upcoming") {
        const today = new Date()
        const weekStart = startOfWeek(today, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
        matchesDateRange = isWithinInterval(event.date, { start: weekStart, end: weekEnd })
      }

      return matchesSearch && matchesType && matchesStatus && matchesOrganizer && matchesPlatform && matchesDateRange
    })

    // Sort events
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return activeTab === "past"
          ? b.date.getTime() - a.date.getTime() // Most recent first for past
          : a.date.getTime() - b.date.getTime() // Soonest first for upcoming
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title)
      } else if (sortBy === "organizer") {
        return a.organizer.localeCompare(b.organizer)
      }
      return 0
    })

    return filtered
  }, [baseEvents, searchQuery, typeFilter, statusFilter, organizerFilter, platformFilter, sortBy, activeTab, dateRangeFilter])

  // Get unique values for filters
  const uniqueTypes = useMemo(() => Array.from(new Set(allEvents.map((e) => e.type))), [allEvents])
  const uniqueStatuses = useMemo(() => Array.from(new Set(allEvents.map((e) => e.status))), [allEvents])
  const uniqueOrganizers = useMemo(() => Array.from(new Set(allEvents.map((e) => e.organizer))), [allEvents])
  const uniquePlatforms = useMemo(
    () => listPlatformFilterOptions(allEvents),
    [allEvents]
  )

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsSheetOpen(true)
  }

  const submitRegistration = async (
    eventId: number | string,
    answers: Record<string, string>
  ) => {
    if (!user?.email) return

    setRegistering((prev) => ({ ...prev, [eventId]: true }))

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.name || undefined,
          answers,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to register for event")
      }

      const data = await response.json()
      setRegDialogOpen(false)
      setPendingRegistration(null)
      await mutateEvents()
      if (data.registration?.status === "registered") {
        void autoImportFromRegistrationResponse(data)
        toast.success("You're registered — calendar invite saved. Check your calendar app or email.")
      } else if (data.registration?.status === "pending") {
        toast.success("Application submitted — the organizer will review it.")
      } else if (data.registration?.status === "waitlisted") {
        toast.success("You're on the waitlist — we'll notify you if a spot opens up.")
      } else {
        toast.success("You're registered for this event.")
      }
    } catch (error: unknown) {
      console.error("Failed to register for event:", error)
      toast.error(error instanceof Error ? error.message : "Failed to register for event.")
    } finally {
      setRegistering((prev) => ({ ...prev, [eventId]: false }))
    }
  }

  const handleRegister = async (eventId: number | string) => {
    const event = allEvents.find((e) => e.id === eventId)
    if (
      !event ||
      event.status === "Registered" ||
      event.status === "Attended" ||
      event.status === "Waitlisted" ||
      event.status === "Pending" ||
      (event.status === "Full" && !event.waitlistEnabled)
    ) {
      return
    }

    if (event.registrationProvider === "luma" && event.lumaEventUrl) {
      window.open(event.lumaEventUrl, "_blank", "noopener,noreferrer")
      return
    }

    if (!user?.email) {
      toast.info("Please log in to register for events.")
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
      )
      return
    }

    const questions = parseRegistrationQuestions(event.registrationQuestions)
    const isFull =
      event.capacity != null && (event.registered ?? 0) >= event.capacity

    if (questions.length > 0 || isPaidEvent(event.price)) {
      setPendingRegistration(event)
      setRegDialogOpen(true)
      return
    }

    await submitRegistration(eventId, {})
  }

  const handleShareEvent = async (event: Event) => {
    const eventUrl = `${window.location.origin}/events/${event.id}`
    const shareText = `Check out this event: ${event.title}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: eventUrl,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.log("Share cancelled or failed")
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(eventUrl)
      toast.success("Event link copied to clipboard.")
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setTypeFilter("all")
    setStatusFilter("all")
    setOrganizerFilter("all")
    setPlatformFilter("all")
    setSortBy("date")
    setDateRangeFilter("all")
    router.replace(window.location.pathname + (activeTab ? `?tab=${activeTab}` : ""), { scroll: false })
  }

  const hasActiveFilters =
    searchQuery ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    organizerFilter !== "all" ||
    platformFilter !== "all" ||
    sortBy !== "date" ||
    dateRangeFilter !== "all"

  const activeFilterCount = [
    searchQuery.length > 0,
    typeFilter !== "all",
    statusFilter !== "all",
    organizerFilter !== "all",
    platformFilter !== "all",
    sortBy !== "date",
    dateRangeFilter !== "all",
  ].filter(Boolean).length

  const advancedFilterCount = [
    statusFilter !== "all",
    organizerFilter !== "all",
    platformFilter !== "all",
    sortBy !== "date",
    dateRangeFilter !== "all",
  ].filter(Boolean).length

  // Filter presets
  const filterPresets = [
    {
      label: "This Week",
      action: () => {
        setActiveTab("upcoming")
        setDateRangeFilter("thisWeek")
        setTypeFilter("all")
        setStatusFilter("all")
        setOrganizerFilter("all")
        setPlatformFilter("all")
        setSearchQuery("")
        setSortBy("date")
      },
    },
    {
      label: "My Events",
      action: () => {
        setActiveTab("upcoming")
        setStatusFilter("Registered")
        setDateRangeFilter("all")
        setTypeFilter("all")
        setOrganizerFilter("all")
        setPlatformFilter("all")
        setSearchQuery("")
        setSortBy("date")
      },
    },
    {
      label: "Open Events",
      action: () => {
        setActiveTab("upcoming")
        setStatusFilter("Open")
        setDateRangeFilter("all")
        setTypeFilter("all")
        setOrganizerFilter("all")
        setPlatformFilter("all")
        setSearchQuery("")
        setSortBy("date")
      },
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="mx-auto max-w-5xl">
          <div className="hidden md:block">
            <Breadcrumbs items={[{ label: "Events & Programs" }]} />
          </div>
          <EventsHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            upcomingCount={activeTab === "upcoming" ? filteredEvents.length : undefined}
          />

          <MetricCardGrid className="mt-4 hidden sm:grid-cols-3 md:grid">
            <MetricCard
              label={activeTab === "upcoming" ? "Upcoming" : "Past events"}
              value={filteredEvents.length}
              icon={CalendarDays}
            />
            <MetricCard
              label="Registered"
              value={filteredEvents.filter((e) => e.status === "Registered").length}
            />
            <MetricCard
              label="Open"
              value={filteredEvents.filter((e) => e.status === "Open").length}
            />
          </MetricCardGrid>

          {/* Mobile: search + chips + filter sheet */}
          <div className="mt-4 space-y-3 md:hidden">
            <div className="flex gap-2">
              <MobileSearchBar
                className="flex-1"
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search events…"
              />
              <MobileFilterSheet
                open={filterSheetOpen}
                onOpenChange={setFilterSheetOpen}
                activeCount={advancedFilterCount}
                onClear={clearFilters}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                    <FilterChipRow>
                      <FilterChip label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
                      {uniqueStatuses.map((status) => (
                        <FilterChip
                          key={status}
                          label={status}
                          active={statusFilter === status}
                          onClick={() => setStatusFilter(status)}
                        />
                      ))}
                    </FilterChipRow>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Organizer</p>
                    <Select value={organizerFilter} onValueChange={setOrganizerFilter}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="All organizers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All organizers</SelectItem>
                        {uniqueOrganizers.map((organizer) => (
                          <SelectItem key={organizer} value={organizer}>{organizer}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Format</p>
                    <FilterChipRow>
                      <FilterChip label="All" active={platformFilter === "all"} onClick={() => setPlatformFilter("all")} />
                      {uniquePlatforms.map((platform) => (
                        <FilterChip
                          key={platform.id}
                          label={platform.label}
                          iconSrc={platform.icon}
                          active={platformFilter === platform.id}
                          onClick={() => setPlatformFilter(platform.id)}
                        />
                      ))}
                    </FilterChipRow>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sort by</p>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="organizer">Organizer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </MobileFilterSheet>
            </div>

            <FilterChipRow>
              <FilterChip
                label="All"
                active={typeFilter === "all" && dateRangeFilter === "all" && statusFilter === "all"}
                onClick={() => {
                  setTypeFilter("all")
                  setDateRangeFilter("all")
                  setStatusFilter("all")
                }}
              />
              {filterPresets.map((preset) => (
                <FilterChip
                  key={preset.label}
                  label={preset.label}
                  active={
                    (preset.label === "This Week" && dateRangeFilter === "thisWeek") ||
                    (preset.label === "My Events" && statusFilter === "Registered") ||
                    (preset.label === "Open Events" && statusFilter === "Open")
                  }
                  onClick={preset.action}
                />
              ))}
              {uniqueTypes.map((type) => (
                <FilterChip
                  key={type}
                  label={eventTypeLabel(type)}
                  active={typeFilter === type}
                  onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
                />
              ))}
            </FilterChipRow>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
                {activeFilterCount > 0 && ` · ${activeFilterCount} filter${activeFilterCount !== 1 ? "s" : ""}`}
              </span>
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters} className="font-medium text-primary">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Desktop: filter bar */}
          <div className="mt-6 hidden space-y-4 md:block">
            <div className="flex flex-wrap gap-2">
              {filterPresets.map((preset) => (
                <Button key={preset.label} variant="outline" size="sm" onClick={preset.action}>
                  {preset.label}
                </Button>
              ))}
            </div>

            <FilterBar className="rounded-md border border-border bg-card p-4">
              <FilterBarItem className="sm:min-w-[280px] sm:flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search events…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-8"
                  />
                </div>
              </FilterBarItem>
              <FilterBarItem>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {eventTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterBarItem>
              <FilterBarItem>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterBarItem>
              <FilterBarItem>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-32">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="organizer">Organizer</SelectItem>
                  </SelectContent>
                </Select>
              </FilterBarItem>
              {hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              ) : null}
            </FilterBar>
            <p className="text-xs text-muted-foreground">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {/* Events list */}
        <div className="mx-auto max-w-5xl">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading events…
            </div>
          ) : filteredEvents.length === 0 ? (
            <EmptyState title="No events found" description="Try adjusting your filters." />
          ) : (
            <div
              className="transition-opacity duration-200 ease-in-out"
              style={{ opacity: isFiltering ? 0.6 : 1 }}
            >
              <div className="md:hidden">
                <EventsTimeline
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  activeTab={activeTab}
                  onRegister={handleRegister}
                  registering={registering}
                />
              </div>
              <div className="hidden md:block">
                <DataList>
                  {filteredEvents.map((event) => (
                    <DataListRow
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                    >
                      <DataListPrimary
                        title={event.title}
                        subtitle={event.organizer}
                      />
                      <DataListMeta>
                        {event.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · {event.time}
                      </DataListMeta>
                      <StatusDot
                        label={event.status}
                        variant={
                          event.status === "Registered"
                            ? "success"
                            : event.status === "Open"
                              ? "warning"
                              : "neutral"
                        }
                      />
                    </DataListRow>
                  ))}
                </DataList>
              </div>
            </div>
          )}
        </div>

        {/* Event Detail Sheet */}
        {selectedEvent && (
          <EventDetailSheet
            event={selectedEvent}
            open={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            onRegister={handleRegister}
            isRegistering={registering[selectedEvent.id] || false}
          />
        )}

        {pendingRegistration && (
          <EventRegistrationDialog
            open={regDialogOpen}
            onOpenChange={(open) => {
              setRegDialogOpen(open)
              if (!open) setPendingRegistration(null)
            }}
            eventTitle={pendingRegistration.title}
            questions={parseRegistrationQuestions(pendingRegistration.registrationQuestions)}
            isWaitlist={Boolean(
              pendingRegistration.capacity != null &&
                (pendingRegistration.registered ?? 0) >= pendingRegistration.capacity &&
                pendingRegistration.waitlistEnabled
            )}
            isPaid={isPaidEvent(pendingRegistration.price)}
            priceLabel={pendingRegistration.priceLabel ?? null}
            loading={Boolean(registering[pendingRegistration.id])}
            onSubmit={(answers) => submitRegistration(pendingRegistration.id, answers)}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
