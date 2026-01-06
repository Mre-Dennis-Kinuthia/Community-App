"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  MapPin, 
  Users, 
  CheckCircle2, 
  X, 
  Clock,
  Wifi,
  Monitor,
  Video,
  Coffee,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Star,
  TrendingUp,
  Zap,
  Loader2,
  ChevronRight,
  Image as ImageIcon,
  Info
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { format, addHours, isSameDay, isBefore, startOfDay } from "date-fns"
import { toast } from "@/lib/toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Enhanced space data with more details
const spaces = [
  {
    id: 1,
    name: "The Boardroom",
    capacity: "12 people",
    capacityNum: 12,
    price: 2500,
    pricePerHour: "2,500 KES/hr",
    image: "/modern-boardroom.png",
    level: "Level 2",
    amenities: ["Projector", "Whiteboard", "Video Conferencing", "WiFi", "Coffee"],
    description: "Professional meeting space perfect for board meetings and presentations",
    rating: 4.8,
    reviews: 24,
    popular: true,
    available: true,
  },
  {
    id: 2,
    name: "Innovation Lab",
    capacity: "20 people",
    capacityNum: 20,
    price: 4000,
    pricePerHour: "4,000 KES/hr",
    image: "/collaborative-lab.jpg",
    level: "Level 1",
    amenities: ["Projector", "Whiteboard", "Video Conferencing", "Sound System", "WiFi"],
    description: "Collaborative workspace designed for team brainstorming and innovation sessions",
    rating: 4.9,
    reviews: 31,
    popular: true,
    available: true,
  },
  {
    id: 3,
    name: "Focus Pod 1",
    capacity: "2 people",
    capacityNum: 2,
    price: 500,
    pricePerHour: "500 KES/hr",
    image: "/small-focus-room.jpg",
    level: "Level 3",
    amenities: ["Whiteboard", "WiFi"],
    description: "Quiet space for focused work and small meetings",
    rating: 4.6,
    reviews: 18,
    popular: false,
    available: true,
  },
  {
    id: 4,
    name: "Wellness Studio",
    capacity: "15 people",
    capacityNum: 15,
    price: 3000,
    pricePerHour: "3,000 KES/hr",
    image: "/placeholder.svg",
    level: "Level 1",
    amenities: ["Sound System", "WiFi", "Mirrors", "Yoga Mats"],
    description: "Flexible space for wellness activities and workshops",
    rating: 4.7,
    reviews: 12,
    popular: false,
    available: true,
  },
]

// Generate time slots with availability
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 9; hour <= 17; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`
    slots.push({
      time,
      display: format(new Date().setHours(hour, 0, 0, 0), "h:mm a"),
      available: Math.random() > 0.3, // 70% availability for demo
    })
  }
  return slots
}

const timeSlots = generateTimeSlots()

// Mock existing bookings
const existingBookings = [
  { spaceId: 1, date: new Date(), time: "02:00 PM", duration: 2 },
  { spaceId: 2, date: new Date(), time: "10:00 AM", duration: 1 },
]

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedSpaces, setSelectedSpaces] = useState<Record<number, { 
    time: string
    duration: number
    space: typeof spaces[0] 
  }>>({})
  const [capacityFilter, setCapacityFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isBooking, setIsBooking] = useState<Record<number, boolean>>({})
  const [showBookingSummary, setShowBookingSummary] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState<"price" | "capacity" | "rating">("rating")

  const handleTimeSelect = (spaceId: number, time: string, duration: number = 1) => {
    const space = spaces.find((s) => s.id === spaceId)
    if (!space) return

    const key = `${spaceId}-${time}`
    if (selectedSpaces[spaceId]?.time === time) {
      // Deselect if same time clicked
      const newSelected = { ...selectedSpaces }
      delete newSelected[spaceId]
      setSelectedSpaces(newSelected)
    } else {
      setSelectedSpaces({
        ...selectedSpaces,
        [spaceId]: { time, duration, space },
      })
    }
  }

  const handleBook = async (spaceId: number) => {
    const selection = selectedSpaces[spaceId]
    if (!selection) return

    if (!selectedDate) {
      toast.warning("Please select a date", "Choose a date from the calendar first")
      return
    }
    
    setIsBooking({ ...isBooking, [spaceId]: true })
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    toast.success(
      "Booking confirmed!",
      `${selection.space.name} on ${format(selectedDate, "PPP")} at ${selection.time} for ${selection.duration} hour${selection.duration > 1 ? 's' : ''}`
    )
    
    // Clear selection after booking
    const newSelected = { ...selectedSpaces }
    delete newSelected[spaceId]
    setSelectedSpaces(newSelected)
    setIsBooking({ ...isBooking, [spaceId]: false })
  }

  const handleBookAll = async () => {
    if (Object.keys(selectedSpaces).length === 0) return
    
    setIsBooking({ ...Object.keys(selectedSpaces).reduce((acc, id) => ({ ...acc, [id]: true }), {}) })
    
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    toast.success(
      "All bookings confirmed!",
      `Successfully booked ${Object.keys(selectedSpaces).length} space${Object.keys(selectedSpaces).length > 1 ? 's' : ''}`
    )
    
    setSelectedSpaces({})
    setIsBooking({})
    setShowBookingSummary(false)
  }

  // Filter and sort spaces
  const filteredAndSortedSpaces = useMemo(() => {
    let filtered = spaces.filter((space) => {
      // Capacity filter
      if (capacityFilter !== "all") {
        if (capacityFilter === "small" && space.capacityNum > 4) return false
        if (capacityFilter === "medium" && (space.capacityNum <= 4 || space.capacityNum > 10)) return false
        if (capacityFilter === "large" && space.capacityNum <= 10) return false
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !space.name.toLowerCase().includes(query) &&
          !space.description.toLowerCase().includes(query) &&
          !space.level.toLowerCase().includes(query) &&
          !space.amenities.some(a => a.toLowerCase().includes(query))
        ) {
          return false
        }
      }
      
      return space.available
    })

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "price") return a.price - b.price
      if (sortBy === "capacity") return b.capacityNum - a.capacityNum
      return b.rating - a.rating
    })

    return filtered
  }, [capacityFilter, searchQuery, sortBy])

  // Calculate total cost
  const totalCost = useMemo(() => {
    return Object.values(selectedSpaces).reduce((total, selection) => {
      return total + (selection.space.price * selection.duration)
    }, 0)
  }, [selectedSpaces])

  const totalSelected = Object.keys(selectedSpaces).length

  // Check if time slot is booked
  const isTimeSlotBooked = (spaceId: number, time: string) => {
    if (!selectedDate) return false
    return existingBookings.some(
      booking => 
        booking.spaceId === spaceId &&
        isSameDay(booking.date, selectedDate) &&
        booking.time === time
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Book Workspace" }]} />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Book Your Workspace</h1>
            <p className="text-muted-foreground text-base">
              Reserve meeting rooms, collaboration zones, and wellness studios at Impact Hub Nairobi.
            </p>
          </div>
          {totalSelected > 0 && (
            <Button 
              onClick={() => setShowBookingSummary(true)}
              className="relative"
            >
              View Booking Summary
              {totalSelected > 0 && (
                <Badge className="ml-2 bg-primary-foreground text-primary">
                  {totalSelected}
                </Badge>
              )}
            </Button>
          )}
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search spaces by name, amenities, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="small">Small (1-4)</SelectItem>
                    <SelectItem value="medium">Medium (5-10)</SelectItem>
                    <SelectItem value="large">Large (10+)</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="capacity">Capacity</SelectItem>
                  </SelectContent>
                </Select>
                {capacityFilter !== "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCapacityFilter("all")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select Date
              </CardTitle>
              <CardDescription>Choose your booking date</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0"
                disabled={(date) => date < startOfDay(new Date())}
              />
              {selectedDate && (
                <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-sm font-medium mb-1">Selected Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedDate, "EEEE, MMM d, yyyy")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spaces List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Available Spaces</CardTitle>
                  <CardDescription>
                    {selectedDate 
                      ? `Showing ${filteredAndSortedSpaces.length} space${filteredAndSortedSpaces.length !== 1 ? 's' : ''} for ${format(selectedDate, "PPP")}`
                      : "Select a date to see available spaces"
                    }
                  </CardDescription>
                </div>
                {totalSelected > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {totalSelected} selected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">Select a date</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Choose a date from the calendar to view available spaces
                  </p>
                </div>
              ) : filteredAndSortedSpaces.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No spaces found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your filters or search query
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedSpaces.map((space) => {
                    const isSelected = selectedSpaces[space.id]
                    const totalPrice = isSelected ? space.price * isSelected.duration : 0
                    
                    return (
                      <div
                        key={space.id}
                        className={`rounded-lg border transition-all ${
                          isSelected 
                            ? "border-primary bg-primary/5 shadow-card" 
                            : "border-border/50 hover:shadow-card"
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex flex-col gap-4 sm:flex-row">
                            {/* Space Image */}
                            <div className="relative h-32 w-full sm:w-40 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                              {space.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={space.image}
                                  alt={space.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              )}
                              {space.popular && (
                                <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                            </div>

                            {/* Space Details */}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-lg">{space.name}</h3>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 fill-primary text-primary" />
                                      <span className="text-sm font-medium">{space.rating}</span>
                                      <span className="text-xs text-muted-foreground">({space.reviews})</span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {space.description}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" /> {space.capacity}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" /> {space.level}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <span className="font-semibold text-primary">{space.pricePerHour}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Amenities */}
                              <div className="flex flex-wrap gap-1.5">
                                {space.amenities.map((amenity) => {
                                  const iconMap: Record<string, React.ReactNode> = {
                                    "WiFi": <Wifi className="h-3 w-3" />,
                                    "Projector": <Monitor className="h-3 w-3" />,
                                    "Video Conferencing": <Video className="h-3 w-3" />,
                                    "Coffee": <Coffee className="h-3 w-3" />,
                                  }
                                  return (
                                    <Badge 
                                      key={amenity} 
                                      variant="outline" 
                                      className="text-xs flex items-center gap-1"
                                    >
                                      {iconMap[amenity] || <Zap className="h-3 w-3" />}
                                      {amenity}
                                    </Badge>
                                  )
                                })}
                              </div>

                              {/* Time Slots */}
                              {selectedDate && (
                                <div className="space-y-2 pt-2 border-t border-border/50">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium">Select Time</p>
                                    {isSelected && (
                                      <Select
                                        value={isSelected.duration.toString()}
                                        onValueChange={(v) => {
                                          setSelectedSpaces({
                                            ...selectedSpaces,
                                            [space.id]: { ...isSelected, duration: parseInt(v) }
                                          })
                                        }}
                                      >
                                        <SelectTrigger className="w-[100px] h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1">1 hour</SelectItem>
                                          <SelectItem value="2">2 hours</SelectItem>
                                          <SelectItem value="3">3 hours</SelectItem>
                                          <SelectItem value="4">4 hours</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {timeSlots.map((slot) => {
                                      const isTimeSelected = isSelected?.time === slot.time
                                      const isBooked = isTimeSlotBooked(space.id, slot.time)
                                      const isDisabled = !slot.available || isBooked
                                      
                                      return (
                                        <Button
                                          key={slot.time}
                                          size="sm"
                                          variant={isTimeSelected ? "default" : "outline"}
                                          className="h-8 text-xs"
                                          onClick={() => !isDisabled && handleTimeSelect(space.id, slot.time, isSelected?.duration || 1)}
                                          disabled={isDisabled}
                                        >
                                          {isTimeSelected && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                          {slot.display}
                                          {isBooked && <X className="ml-1 h-3 w-3" />}
                                        </Button>
                                      )
                                    })}
                                  </div>
                                  {isSelected && (
                                    <div className="flex items-center justify-between pt-2">
                                      <div className="text-sm">
                                        <span className="text-muted-foreground">Total: </span>
                                        <span className="font-semibold text-primary">
                                          {totalPrice.toLocaleString()} KES
                                        </span>
                                        <span className="text-muted-foreground">
                                          {" "}({isSelected.duration} hour{isSelected.duration > 1 ? 's' : ''})
                                        </span>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() => handleBook(space.id)}
                                        disabled={isBooking[space.id]}
                                        className="button-press"
                                      >
                                        {isBooking[space.id] ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Booking...
                                          </>
                                        ) : (
                                          <>
                                            Confirm Booking
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary Dialog */}
        <Dialog open={showBookingSummary} onOpenChange={setShowBookingSummary}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Booking Summary</DialogTitle>
              <DialogDescription>
                Review your selected spaces before confirming
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {Object.entries(selectedSpaces).map(([spaceId, selection]) => (
                <div
                  key={spaceId}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/30"
                >
                  <div className="flex-1">
                    <p className="font-medium">{selection.space.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate && format(selectedDate, "PPP")} at {selection.time}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Duration: {selection.duration} hour{selection.duration > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {(selection.space.price * selection.duration).toLocaleString()} KES
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newSelected = { ...selectedSpaces }
                        delete newSelected[parseInt(spaceId)]
                        setSelectedSpaces(newSelected)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <p className="text-lg font-semibold">Total</p>
                <p className="text-2xl font-bold text-primary">
                  {totalCost.toLocaleString()} KES
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowBookingSummary(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleBookAll}
                  disabled={Object.keys(isBooking).some(id => isBooking[parseInt(id)])}
                >
                  {Object.keys(isBooking).some(id => isBooking[parseInt(id)]) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      Confirm All Bookings
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
