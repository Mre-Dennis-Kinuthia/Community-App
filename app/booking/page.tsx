"use client"

import { useState } from "react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, CheckCircle2, X } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { format } from "date-fns"

const spaces = [
  {
    id: 1,
    name: "The Boardroom",
    capacity: "12 people",
    capacityNum: 12,
    price: "2,500 KES/hr",
    priceNum: 2500,
    image: "/modern-boardroom.png",
    level: "Level 2",
    amenities: ["Projector", "Whiteboard", "Video Conferencing"],
  },
  {
    id: 2,
    name: "Innovation Lab",
    capacity: "20 people",
    capacityNum: 20,
    price: "4,000 KES/hr",
    priceNum: 4000,
    image: "/collaborative-lab.jpg",
    level: "Level 1",
    amenities: ["Projector", "Whiteboard", "Video Conferencing", "Sound System"],
  },
  {
    id: 3,
    name: "Focus Pod 1",
    capacity: "2 people",
    capacityNum: 2,
    price: "500 KES/hr",
    priceNum: 500,
    image: "/small-focus-room.jpg",
    level: "Level 3",
    amenities: ["Whiteboard"],
  },
]

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
]

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedSpaces, setSelectedSpaces] = useState<Record<number, { time: string; space: typeof spaces[0] }>>({})
  const [capacityFilter, setCapacityFilter] = useState<string>("all")
  const [showBooked, setShowBooked] = useState(false)
  const [isBooking, setIsBooking] = useState<Record<number, boolean>>({})
  const [isFirstBooking, setIsFirstBooking] = useState(() => {
    if (typeof window !== "undefined") {
      return !localStorage.getItem("hasBookedBefore")
    }
    return false
  })

  const handleTimeSelect = (spaceId: number, time: string) => {
    const space = spaces.find((s) => s.id === spaceId)
    if (!space) return

    if (selectedSpaces[spaceId]?.time === time) {
      // Deselect if same time clicked
      const newSelected = { ...selectedSpaces }
      delete newSelected[spaceId]
      setSelectedSpaces(newSelected)
    } else {
      setSelectedSpaces({
        ...selectedSpaces,
        [spaceId]: { time, space },
      })
    }
  }

  const handleBook = async (spaceId: number) => {
    const selection = selectedSpaces[spaceId]
    if (selection) {
      if (!selectedDate) {
        toast.warning("Please select a date", "Choose a date from the calendar first")
        return
      }
      
      setIsBooking({ ...isBooking, [spaceId]: true })
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Mark as first booking for celebration
      const isFirst = isFirstBooking
      if (isFirst && typeof window !== "undefined") {
        localStorage.setItem("hasBookedBefore", "true")
        setIsFirstBooking(false)
      }
      
      toast.success(
        "Booking confirmed!",
        `${selection.space.name} on ${format(selectedDate, "PPP")} at ${selection.time}`
      )
      
      // Trigger celebration for first booking
      if (isFirst) {
        // Confetti effect (we'll add a simple visual celebration)
        const confettiEvent = new CustomEvent("celebrate", { detail: { type: "firstBooking" } })
        window.dispatchEvent(confettiEvent)
      }
      
      // Clear selection after booking
      const newSelected = { ...selectedSpaces }
      delete newSelected[spaceId]
      setSelectedSpaces(newSelected)
      setIsBooking({ ...isBooking, [spaceId]: false })
    }
  }

  const filteredSpaces = spaces.filter((space) => {
    if (capacityFilter === "all") return true
    if (capacityFilter === "small") return space.capacityNum <= 4
    if (capacityFilter === "medium") return space.capacityNum > 4 && space.capacityNum <= 10
    if (capacityFilter === "large") return space.capacityNum > 10
    return true
  })

  const totalSelected = Object.keys(selectedSpaces).length

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <Breadcrumbs items={[{ label: "Book Space" }]} />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Book Your Workspace</h1>
          <p className="text-muted-foreground text-base">
            Reserve meeting rooms, collaboration zones, and wellness studios at our Ikigai partnership space.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
            {capacityFilter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCapacityFilter("all")}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
          {totalSelected > 0 && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {totalSelected} {totalSelected === 1 ? "space" : "spaces"} selected
            </Badge>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3 mt-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Available Spaces</CardTitle>
              <CardDescription>
                {selectedDate ? `Showing available slots for ${format(selectedDate, "PPP")}` : "Select a date to see available spaces"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSpaces.map((space) => {
                  const isSelected = selectedSpaces[space.id]
                  return (
                    <div
                      key={space.id}
                      className={`flex flex-col gap-4 rounded-lg border p-4 transition-all ${
                        isSelected ? "border-primary/30 bg-primary/5 shadow-card" : "hover:shadow-soft"
                      } sm:flex-row`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={space.image || "/placeholder.svg"}
                        alt={space.name}
                        className="h-24 w-full rounded-md object-cover sm:w-32"
                        loading="lazy"
                      />
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{space.name}</h3>
                            <span className="text-sm font-bold text-primary">{space.price}</span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" /> {space.capacity}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {space.level}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {space.amenities.map((amenity) => (
                              <Badge key={amenity} variant="outline" className="text-[10px]">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {timeSlots.map((time) => {
                              const isTimeSelected = isSelected?.time === time
                              return (
                                <Button
                                  key={time}
                                  size="sm"
                                  variant={isTimeSelected ? "default" : "outline"}
                                  className="h-8 text-xs"
                                  onClick={() => handleTimeSelect(space.id, time)}
                                >
                                  {isTimeSelected && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                  {time}
                                </Button>
                              )
                            })}
                          </div>
                          {isSelected && (
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() => handleBook(space.id)}
                              disabled={isBooking[space.id]}
                            >
                              {isBooking[space.id] ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Booking...
                                </>
                              ) : (
                                "Confirm Booking"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
