"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Calendar, Filter, Loader2, Clock, MapPin, Users, Video, ExternalLink } from "lucide-react"
import { EventsHeader } from "@/components/events/events-header"
import { EventsTimeline } from "@/components/events/events-timeline"
import { EventDetailSheet } from "@/components/events/event-detail-sheet"
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, isWithinInterval } from "date-fns"

// Expanded mock event data
const pastEvents = [
  {
    id: 1,
    title: "Quikk Webinar: API Evolution",
    type: "Webinar",
    category: "Technology",
    time: "15:00",
    endTime: "16:30",
    organizer: "Quikk API",
    platform: "Google Meet",
    status: "Invited",
    date: new Date(2024, 10, 15), // Nov 15, 2024
    thumbnail: "/placeholder.svg",
    description: "Join us for an in-depth webinar exploring the evolution of APIs and how they're shaping the future of fintech in Africa. Learn about best practices, security considerations, and integration strategies.",
    speakers: ["John Mwangi", "Sarah Kimani"],
    tags: ["API", "FinTech", "Technology"],
    capacity: 100,
    registered: 87,
  },
  {
    id: 2,
    title: "Quikk API Webinar: Auto Commissions",
    type: "Webinar",
    category: "Business",
    time: "16:00",
    endTime: "17:00",
    organizer: "Quikk API",
    platform: "Google Meet",
    status: "Invited",
    date: new Date(2024, 5, 4), // Jun 4, 2024
    thumbnail: "/placeholder.svg",
    description: "Discover how to automate commission payments using Quikk API. Perfect for businesses looking to streamline their payment processes.",
    speakers: ["David Ochieng"],
    tags: ["API", "Payments", "Automation"],
    capacity: 50,
    registered: 42,
  },
  {
    id: 3,
    title: "Memethon Hackerhouse",
    type: "Hackathon",
    category: "Innovation",
    time: "09:00",
    endTime: "18:00",
    organizer: "Impact Hub Nairobi",
    platform: "Impact Hub Nairobi",
    status: "Attended",
    date: new Date(2024, 4, 17), // May 17, 2024
    thumbnail: "/placeholder.svg",
    description: "A full-day hackathon focused on building innovative solutions for social impact. Teams compete to create the best prototype addressing real-world challenges.",
    speakers: ["Multiple mentors"],
    tags: ["Hackathon", "Innovation", "Social Impact"],
    capacity: 30,
    registered: 30,
  },
  {
    id: 4,
    title: "Startup Funding Workshop",
    type: "Workshop",
    category: "Business",
    time: "14:00",
    endTime: "17:00",
    organizer: "Impact Hub Nairobi",
    platform: "Impact Hub Nairobi",
    status: "Attended",
    date: new Date(2024, 3, 10), // Apr 10, 2024
    thumbnail: "/placeholder.svg",
    description: "Learn the fundamentals of startup funding, from seed rounds to Series A. Includes pitch deck reviews and investor Q&A.",
    speakers: ["Mary Wanjiku", "James Mwangi"],
    tags: ["Funding", "Startups", "Investment"],
    capacity: 25,
    registered: 25,
  },
]

const upcomingEvents = [
  {
    id: 5,
    title: "Social Innovation Bootcamp",
    type: "Program",
    category: "Acceleration",
    time: "09:00",
    endTime: "17:00",
    organizer: "Impact Hub Nairobi",
    platform: "Impact Hub Nairobi",
    status: "Registered",
    date: new Date(2025, 1, 15),
    thumbnail: "/placeholder.svg",
    description: "Intensive 6-week program for scaling social impact ventures. Includes mentorship, workshops, and investor connections.",
    speakers: ["Program Team", "Industry Mentors"],
    tags: ["Acceleration", "Social Impact", "Mentorship"],
    capacity: 25,
    registered: 18,
    registrationDeadline: new Date(2025, 1, 10),
  },
  {
    id: 6,
    title: "Networking Mixer: Climate Solutions",
    type: "Networking",
    category: "Networking",
    time: "18:00",
    endTime: "20:00",
    organizer: "Impact Hub Nairobi",
    platform: "Ikigai Partnership Space",
    status: "Open",
    date: new Date(2025, 1, 8),
    thumbnail: "/placeholder.svg",
    description: "Connect with climate-focused entrepreneurs, investors, and policymakers working on sustainable solutions.",
    speakers: ["Guest speakers TBA"],
    tags: ["Networking", "Climate", "Sustainability"],
    capacity: 50,
    registered: 32,
  },
  {
    id: 7,
    title: "Design Thinking Workshop",
    type: "Workshop",
    category: "Design",
    time: "10:00",
    endTime: "14:00",
    organizer: "Impact Hub Nairobi",
    platform: "Innovation Lab",
    status: "Registered",
    date: new Date(2025, 1, 12),
    thumbnail: "/placeholder.svg",
    description: "Hands-on workshop on design thinking methodology for solving complex social challenges.",
    speakers: ["Design Team"],
    tags: ["Design", "Workshop", "Methodology"],
    capacity: 20,
    registered: 20,
  },
  {
    id: 8,
    title: "Mentorship Workshop: Fundraising Strategies",
    type: "Workshop",
    category: "Mentorship",
    time: "14:00",
    endTime: "16:00",
    organizer: "Impact Hub Nairobi",
    platform: "Impact Hub Nairobi",
    status: "Open",
    date: new Date(2025, 1, 22),
    thumbnail: "/placeholder.svg",
    description: "Learn effective fundraising strategies from experienced investors and successful entrepreneurs.",
    speakers: ["Investor Panel"],
    tags: ["Fundraising", "Mentorship", "Investment"],
    capacity: 30,
    registered: 15,
  },
  {
    id: 9,
    title: "Tech Talk: AI in Social Impact",
    type: "Webinar",
    category: "Technology",
    time: "15:00",
    endTime: "16:30",
    organizer: "Impact Hub Nairobi",
    platform: "Google Meet",
    status: "Open",
    date: new Date(2025, 1, 20),
    thumbnail: "/placeholder.svg",
    description: "Explore how artificial intelligence is being used to solve social challenges across Africa.",
    speakers: ["AI Experts"],
    tags: ["AI", "Technology", "Social Impact"],
    capacity: 100,
    registered: 45,
  },
  {
    id: 10,
    title: "Monthly Townhall",
    type: "Networking",
    category: "Community",
    time: "16:00",
    endTime: "18:00",
    organizer: "Impact Hub Nairobi",
    platform: "Impact Hub Nairobi",
    status: "Open",
    date: new Date(2025, 1, 28),
    thumbnail: "/placeholder.svg",
    description: "Monthly community gathering to share updates, celebrate wins, and connect with fellow members.",
    speakers: ["Community Team"],
    tags: ["Community", "Networking", "Updates"],
    capacity: 40,
    registered: 8,
  },
  {
    id: 11,
    title: "Impact Measurement Workshop",
    type: "Workshop",
    category: "Education",
    time: "10:00",
    endTime: "13:00",
    organizer: "Impact Hub Nairobi",
    platform: "Impact Hub Nairobi",
    status: "Open",
    date: new Date(2025, 2, 5),
    thumbnail: "/placeholder.svg",
    description: "Learn how to measure and communicate your social impact effectively. Essential for social entrepreneurs seeking funding and partnerships.",
    speakers: ["Impact Measurement Experts"],
    tags: ["Impact", "Measurement", "Workshop"],
    capacity: 35,
    registered: 22,
  },
  {
    id: 12,
    title: "Women in Tech Networking Breakfast",
    type: "Networking",
    category: "Networking",
    time: "08:00",
    endTime: "10:00",
    organizer: "Impact Hub Nairobi",
    platform: "Ikigai Partnership Space",
    status: "Open",
    date: new Date(2025, 2, 8),
    thumbnail: "/placeholder.svg",
    description: "Join us for a networking breakfast celebrating women in technology. Connect with fellow entrepreneurs, share experiences, and build meaningful relationships.",
    speakers: ["Women Tech Leaders"],
    tags: ["Networking", "Women in Tech", "Breakfast"],
    capacity: 30,
    registered: 18,
  },
  {
    id: 13,
    title: "Sustainable Agriculture Webinar",
    type: "Webinar",
    category: "Agriculture",
    time: "14:00",
    endTime: "15:30",
    organizer: "Impact Hub Nairobi",
    platform: "Google Meet",
    status: "Open",
    date: new Date(2025, 2, 12),
    thumbnail: "/placeholder.svg",
    description: "Explore innovative sustainable agriculture practices and technologies that are transforming farming in Kenya and across Africa.",
    speakers: ["Agricultural Experts", "Farmers"],
    tags: ["Agriculture", "Sustainability", "Webinar"],
    capacity: 80,
    registered: 52,
  },
  {
    id: 14,
    title: "Pitch Practice Session",
    type: "Workshop",
    category: "Business",
    time: "15:00",
    endTime: "17:00",
    organizer: "Impact Hub Nairobi",
    platform: "Impact Hub Nairobi",
    status: "Open",
    date: new Date(2025, 2, 15),
    thumbnail: "/placeholder.svg",
    description: "Practice your pitch in a supportive environment. Get feedback from experienced entrepreneurs and investors to refine your presentation skills.",
    speakers: ["Pitch Coaches", "Investors"],
    tags: ["Pitching", "Business", "Workshop"],
    capacity: 20,
    registered: 12,
  },
  {
    id: 15,
    title: "Climate Innovation Challenge Launch",
    type: "Program",
    category: "Innovation",
    time: "11:00",
    endTime: "13:00",
    organizer: "Impact Hub Nairobi",
    platform: "Impact Hub Nairobi",
    status: "Open",
    date: new Date(2025, 2, 20),
    thumbnail: "/placeholder.svg",
    description: "Launch event for our annual Climate Innovation Challenge. Learn about the competition, prizes, and how to participate in building climate solutions.",
    speakers: ["Challenge Organizers", "Previous Winners"],
    tags: ["Climate", "Innovation", "Challenge"],
    capacity: 60,
    registered: 38,
  },
]

const allEvents = [...pastEvents, ...upcomingEvents]

export default function EventsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">(
    (searchParams.get("tab") as "upcoming" | "past") || "past"
  )
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get("type") || "all")
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "all")
  const [organizerFilter, setOrganizerFilter] = useState<string>(searchParams.get("organizer") || "all")
  const [platformFilter, setPlatformFilter] = useState<string>(searchParams.get("platform") || "all")
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "date")
  const [dateRangeFilter, setDateRangeFilter] = useState<string>(searchParams.get("dateRange") || "all")
  const [selectedEvent, setSelectedEvent] = useState<typeof allEvents[0] | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [registering, setRegistering] = useState<Record<number, boolean>>({})

  // Update URL params when filters change
  useEffect(() => {
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
  }, [activeTab, searchQuery, typeFilter, statusFilter, organizerFilter, platformFilter, sortBy, dateRangeFilter, router])

  // Get events based on active tab
  const baseEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return activeTab === "past"
      ? allEvents.filter((e) => e.date < today)
      : allEvents.filter((e) => e.date >= today)
  }, [activeTab])

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = baseEvents.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesType = typeFilter === "all" || event.type === typeFilter
      const matchesStatus = statusFilter === "all" || event.status === statusFilter
      const matchesOrganizer = organizerFilter === "all" || event.organizer === organizerFilter
      const matchesPlatform = platformFilter === "all" || event.platform === platformFilter

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
  const uniqueTypes = useMemo(() => Array.from(new Set(allEvents.map((e) => e.type))), [])
  const uniqueStatuses = useMemo(() => Array.from(new Set(allEvents.map((e) => e.status))), [])
  const uniqueOrganizers = useMemo(() => Array.from(new Set(allEvents.map((e) => e.organizer))), [])
  const uniquePlatforms = useMemo(() => Array.from(new Set(allEvents.map((e) => e.platform))), [])

  const handleEventClick = (event: typeof allEvents[0]) => {
    setSelectedEvent(event)
    setIsSheetOpen(true)
  }

  const handleRegister = async (eventId: number) => {
    const event = allEvents.find((e) => e.id === eventId)
    if (!event || event.status === "Full" || event.status === "Registered" || event.status === "Attended") {
      return
    }

    setRegistering({ ...registering, [eventId]: true })
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setRegistering({ ...registering, [eventId]: false })

    // Update event status (in real app, this would be an API call)
    if (event) {
      event.status = "Registered"
      event.registered = (event.registered || 0) + 1
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
      <div className="space-y-6">
        <div className="mx-auto max-w-5xl">
          <Breadcrumbs items={[{ label: "Events & Programs" }]} />
          <div className="mb-6">
            <EventsHeader activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Filter Presets */}
          <div className="flex flex-wrap gap-2">
            {filterPresets.map((preset) => (
              <Button
                key={preset.label}
                variant="outline"
                size="sm"
                onClick={preset.action}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Search and Filters */}
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search events by title, organizer, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filters */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {uniqueStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={organizerFilter} onValueChange={setOrganizerFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Organizers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Organizers</SelectItem>
                      {uniqueOrganizers.map((organizer) => (
                        <SelectItem key={organizer} value={organizer}>
                          {organizer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Platforms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      {uniquePlatforms.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Summary */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary">
                        {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} applied
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
                    </span>
                  </div>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="mr-2 h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Timeline */}
        <div className="mx-auto max-w-5xl">
          <EventsTimeline
            events={filteredEvents}
            onEventClick={handleEventClick}
            activeTab={activeTab}
            onRegister={handleRegister}
            registering={registering}
          />
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
      </div>
    </DashboardLayout>
  )
}
