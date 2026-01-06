"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Clock, 
  Search, 
  X,
  Sparkles,
  TrendingUp,
  BookOpen,
  Users2
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { format } from "date-fns"
import { toast } from "@/lib/toast"

const events = [
  {
    id: 1,
    title: "Social Innovation Bootcamp",
    type: "Program",
    category: "Acceleration",
    date: new Date(2025, 1, 15),
    time: "09:00 AM - 05:00 PM",
    location: "Impact Hub Nairobi",
    capacity: 25,
    registered: 18,
    description: "Intensive 6-week program for scaling social impact ventures. Includes mentorship, workshops, and investor connections.",
    status: "Open",
    featured: true,
  },
  {
    id: 2,
    title: "Networking Mixer: Climate Solutions",
    type: "Event",
    category: "Networking",
    date: new Date(2025, 1, 8),
    time: "06:00 PM - 08:00 PM",
    location: "Ikigai Partnership Space",
    capacity: 50,
    registered: 32,
    description: "Connect with climate-focused entrepreneurs, investors, and policymakers working on sustainable solutions.",
    status: "Open",
    featured: false,
  },
  {
    id: 3,
    title: "Mentorship Workshop: Fundraising Strategies",
    type: "Workshop",
    category: "Mentorship",
    date: new Date(2025, 1, 22),
    time: "02:00 PM - 04:00 PM",
    location: "Impact Hub Nairobi",
    capacity: 30,
    registered: 15,
    description: "Learn effective fundraising strategies from experienced investors and successful entrepreneurs.",
    status: "Open",
    featured: false,
  },
  {
    id: 4,
    title: "Impact Hub Incubation Program",
    type: "Program",
    category: "Incubation",
    date: new Date(2025, 2, 1),
    time: "09:00 AM - 05:00 PM",
    location: "Impact Hub Nairobi",
    capacity: 15,
    registered: 12,
    description: "12-week incubation program for early-stage social enterprises. Includes workspace, mentorship, and seed funding opportunities.",
    status: "Open",
    featured: true,
  },
  {
    id: 5,
    title: "Design Thinking Workshop",
    type: "Workshop",
    category: "Workshop",
    date: new Date(2025, 1, 12),
    time: "10:00 AM - 02:00 PM",
    location: "Innovation Lab",
    capacity: 20,
    registered: 20,
    description: "Hands-on workshop on design thinking methodology for solving complex social challenges.",
    status: "Full",
    featured: false,
  },
  {
    id: 6,
    title: "Global Impact Hub Network Meetup",
    type: "Event",
    category: "Networking",
    date: new Date(2025, 1, 28),
    time: "05:00 PM - 07:00 PM",
    location: "Impact Hub Nairobi",
    capacity: 40,
    registered: 8,
    description: "Connect with members from other Impact Hub locations worldwide. Share experiences and explore collaboration opportunities.",
    status: "Open",
    featured: false,
  },
]

const typeIcons: Record<string, any> = {
  Program: Sparkles,
  Event: Users2,
  Workshop: BookOpen,
}

const typeColors: Record<string, string> = {
  Program: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  Event: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  Workshop: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
}

const categoryColors: Record<string, string> = {
  Acceleration: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  Incubation: "bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400",
  Networking: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
  Mentorship: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  Workshop: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
}

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = typeFilter === "all" || event.type === typeFilter
      const matchesCategory = categoryFilter === "all" || event.category === categoryFilter
      const matchesStatus = statusFilter === "all" || event.status === statusFilter
      
      const matchesDate = !selectedDate || 
        (event.date.getDate() === selectedDate.getDate() &&
         event.date.getMonth() === selectedDate.getMonth() &&
         event.date.getFullYear() === selectedDate.getFullYear())

      return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesDate
    })
  }, [searchQuery, typeFilter, categoryFilter, statusFilter, selectedDate])

  const handleRegister = (eventId: number) => {
    const event = events.find((e) => e.id === eventId)
    if (event?.status === "Full") {
      toast.error("This event is full. Please check for waitlist options.")
      return
    }
    toast.success(`Registered for "${event?.title}"! You'll receive a confirmation email shortly.`)
  }

  const hasActiveFilters = typeFilter !== "all" || categoryFilter !== "all" || statusFilter !== "all" || selectedDate

  const clearFilters = () => {
    setTypeFilter("all")
    setCategoryFilter("all")
    setStatusFilter("all")
    setSelectedDate(undefined)
    setSearchQuery("")
  }

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <Breadcrumbs items={[{ label: "Events & Programs" }]} />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Events & Programs</h1>
          <p className="text-muted-foreground text-base">
            Discover workshops, networking events, and programs to accelerate your social impact journey.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events, programs, workshops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 shadow-sm"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px] shadow-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Program">Programs</SelectItem>
              <SelectItem value="Event">Events</SelectItem>
              <SelectItem value="Workshop">Workshops</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px] shadow-sm">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Acceleration">Acceleration</SelectItem>
              <SelectItem value="Incubation">Incubation</SelectItem>
              <SelectItem value="Networking">Networking</SelectItem>
              <SelectItem value="Mentorship">Mentorship</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] shadow-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Full">Full</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="shadow-sm">
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Filter by Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border-0"
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
                {selectedDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(undefined)}
                    className="mt-4 w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear Date
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredEvents.length === 0 ? (
              <Card className="border-border/50 shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No events found matching your filters.
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredEvents.map((event) => {
                const TypeIcon = typeIcons[event.type] || CalendarIcon
                const spotsLeft = event.capacity - event.registered
                const isFull = event.status === "Full"

                return (
                  <Card
                    key={event.id}
                    className={`border-border/50 shadow-card transition-all hover:shadow-card hover:scale-[1.01] ${
                      event.featured ? "ring-2 ring-primary/20" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {event.featured && (
                              <Badge className="bg-primary/10 text-primary border-primary/20">
                                Featured
                              </Badge>
                            )}
                            <Badge className={typeColors[event.type]}>
                              <TypeIcon className="mr-1 h-3 w-3" />
                              {event.type}
                            </Badge>
                            <Badge className={categoryColors[event.category]}>
                              {event.category}
                            </Badge>
                            {isFull && (
                              <Badge variant="destructive">Full</Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <CardDescription className="text-base">
                            {event.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          {format(event.date, "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {event.registered}/{event.capacity} registered
                          {!isFull && spotsLeft > 0 && (
                            <span className="text-primary">({spotsLeft} spots left)</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          onClick={() => handleRegister(event.id)}
                          disabled={isFull}
                          className="shadow-sm"
                        >
                          {isFull ? "Waitlist" : "Register Now"}
                        </Button>
                        {!isFull && (
                          <span className="text-sm text-muted-foreground">
                            {spotsLeft} spots remaining
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

