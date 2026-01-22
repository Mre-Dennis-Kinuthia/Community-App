"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { toast } from "@/lib/toast"
import { useWorkspace } from "@/lib/hooks/use-workspace"
import { useAvailability } from "@/lib/hooks/use-availability"
import { usePricing } from "@/lib/hooks/use-pricing"
import { BookingHeader } from "@/components/booking/booking-header"
import { AvailabilityCalendar } from "@/components/booking/availability-calendar"
import { TimeSelector, type BookingDuration } from "@/components/booking/time-selector"
import { ResourceSelector, type ResourceType } from "@/components/booking/resource-selector"
import { PricingBreakdown } from "@/components/booking/pricing-breakdown"
import { AmenitiesGrid } from "@/components/booking/amenities-grid"
import { ImageGallery } from "@/components/booking/image-gallery"
import { AddOnSelector } from "@/components/booking/add-on-selector"
import { LocationSection } from "@/components/booking/location-section"
import { StickyBookingSummary } from "@/components/booking/sticky-booking-summary"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BookingPage() {
  const workspaceId = "impact-hub-nairobi"
  
  // Hooks
  const { workspace, isLoading: isLoadingWorkspace } = useWorkspace(workspaceId)
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>("hot-desk")
  
  // Provide fallback values when workspace is null
  const safeWorkspace = workspace || {
    id: workspaceId,
    name: "Workspace",
    location: "",
    address: "",
    valueProposition: "",
    startingPrice: 0,
    currency: "KES",
    rating: 0,
    reviewCount: 0,
    images: [],
    amenities: [],
    whoIsThisFor: "",
    openingHours: "",
    houseRules: [],
    securityInfo: "",
    coordinates: { lat: 0, lng: 0 },
    landmarks: [],
  }
  const { 
    slots, 
    unavailableDates,
    datesWithBookings,
    nextAvailable, 
    selectedDate, 
    setSelectedDate 
  } = useAvailability(workspaceId, selectedResource || undefined)
  
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<BookingDuration>("hourly")
  const [selectedHalfDay, setSelectedHalfDay] = useState<"morning" | "afternoon" | undefined>(undefined)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [isBooking, setIsBooking] = useState(false)
  const [activeTab, setActiveTab] = useState("book")

  const { pricing, calculateTotal } = usePricing(
    workspaceId,
    selectedResource || "hot-desk",
    selectedDate || undefined,
    selectedDuration === "hourly" ? 1 : selectedDuration === "half-day" ? 4 : 8
  )
  
  // Provide fallback pricing when null
  const safePricing = pricing || {
    basePrice: 0,
    currency: "KES",
    options: [],
    addOns: [],
  }

  // Calculate pricing
  const totalPrice = useMemo(() => {
    if (!selectedDate || !selectedResource) return 0
    
    // Check if we have required selections based on resource type and duration
    let hasRequiredSelections = false
    
    if (selectedResource === "hot-desk") {
      if (selectedDuration === "full-day") {
        hasRequiredSelections = true // Full day doesn't need time selection
      } else if (selectedDuration === "half-day") {
        hasRequiredSelections = !!selectedHalfDay // Half day needs morning/afternoon selection
      } else {
        hasRequiredSelections = !!selectedTime // Hourly needs time selection
      }
    } else {
      // Meeting rooms and private offices always need time selection
      hasRequiredSelections = !!selectedTime
    }
    
    if (!hasRequiredSelections) return 0
    
    const basePrice = safePricing.options.find(opt => opt.type === selectedDuration)?.price || 0
    const addOnsPrice = selectedAddOns.reduce((sum, id) => {
      const addOn = safePricing.addOns.find(a => a.id === id)
      return sum + (addOn?.price || 0)
    }, 0)
    
    return basePrice + addOnsPrice
  }, [selectedDate, selectedTime, selectedResource, selectedDuration, selectedHalfDay, selectedAddOns, safePricing])

  // Check if booking is valid
  const isValidBooking = useMemo(() => {
    if (!selectedDate || !selectedResource || totalPrice <= 0) return false
    
    // For hot desks: full-day doesn't need time, half-day needs half-day selection, hourly needs time
    if (selectedResource === "hot-desk") {
      if (selectedDuration === "full-day") return true
      if (selectedDuration === "half-day") return !!selectedHalfDay
      return !!selectedTime
    }
    
    // For meeting rooms: always need time
    return !!selectedTime
  }, [selectedDate, selectedTime, selectedResource, selectedDuration, selectedHalfDay, totalPrice])

  // Calculate start time based on duration and selection
  // This ensures we always have a valid startTime for the API
  const calculateStartTime = useMemo(() => {
    // Full-day hot desk: always starts at 9 AM
    if (selectedResource === "hot-desk" && selectedDuration === "full-day") {
      return "09:00"
    }
    // Half-day hot desk: morning (9 AM) or afternoon (1 PM)
    if (selectedResource === "hot-desk" && selectedDuration === "half-day" && selectedHalfDay) {
      return selectedHalfDay === "morning" ? "09:00" : "13:00"
    }
    // Hourly or meeting rooms: use selected time
    return selectedTime || null
  }, [selectedResource, selectedDuration, selectedHalfDay, selectedTime])

  // Handle booking
  const handleConfirmBooking = async () => {
    if (!isValidBooking || !selectedDate || !selectedResource) {
      toast.warning("Complete your selection", "Please complete all required fields")
      return
    }

    // Validate time selection based on resource type
    if (selectedResource !== "hot-desk" || selectedDuration === "hourly") {
      if (!selectedTime) {
        toast.warning("Complete your selection", "Please select a time")
        return
      }
    }

    setIsBooking(true)
    
    try {
      const startTime = calculateStartTime
      
      console.log("[BOOKING PAGE] Submitting booking:", {
        resourceType: selectedResource,
        date: selectedDate.toISOString(),
        startTime,
        duration: selectedDuration,
        halfDay: selectedHalfDay,
        basePrice: safePricing.options.find(opt => opt.type === selectedDuration)?.price || 0,
        addOnsPrice: selectedAddOns.reduce((sum, id) => {
          const addOn = safePricing.addOns.find(a => a.id === id)
          return sum + (addOn?.price || 0)
        }, 0),
        totalPrice,
        addOns: selectedAddOns,
      })

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceType: selectedResource,
          date: selectedDate.toISOString(),
          startTime,
          duration: selectedDuration,
          basePrice: pricing.options.find(opt => opt.type === selectedDuration)?.price || 0,
          addOnsPrice: selectedAddOns.reduce((sum, id) => {
            const addOn = pricing.addOns.find(a => a.id === id)
            return sum + (addOn?.price || 0)
          }, 0),
          totalPrice,
          addOns: selectedAddOns,
          workspaceId: workspaceId,
        }),
      })

      const data = await response.json()
      console.log("[BOOKING PAGE] Booking response:", response.status, data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking")
      }

      // Redirect to success page with booking ID
      window.location.href = `/booking/success?id=${data.booking.id}`
    } catch (error) {
      console.error("[BOOKING PAGE] Booking error:", error)
      toast.error(
        "Booking failed",
        error instanceof Error ? error.message : "Please try again or contact support."
      )
      setIsBooking(false)
    }
  }

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addOnId)
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    )
  }

  const handleCheckAvailability = () => {
    // Scroll to calendar
    document.getElementById("availability-section")?.scrollIntoView({ behavior: "smooth" })
  }

  // Available time slots for selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate) return []
    return slots.filter(slot => {
      const slotDate = new Date(slot.date)
      return (
        slotDate.getDate() === selectedDate.getDate() &&
        slotDate.getMonth() === selectedDate.getMonth() &&
        slotDate.getFullYear() === selectedDate.getFullYear() &&
        slot.resourceType === selectedResource
      )
    }).map(slot => ({
      time: slot.time,
      available: slot.available
    }))
  }, [slots, selectedDate, selectedResource])

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-24 lg:pb-8">
        <Breadcrumbs items={[{ label: "Book Workspace" }]} />

        {/* Above the Fold - Critical Information */}
        <div className="space-y-8">
          {isLoadingWorkspace ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground">Loading workspace...</p>
              </div>
            </div>
          ) : (
            <>
              <BookingHeader
                workspace={safeWorkspace}
                onBookNow={handleCheckAvailability}
                onCheckAvailability={handleCheckAvailability}
              />

              {/* Image Gallery */}
              <ImageGallery images={safeWorkspace.images} spaceName={safeWorkspace.name} />
            </>
          )}
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="book">Book Now</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Selection */}
              <div className="lg:col-span-2 space-y-6">
                {/* Resource Selection */}
                <div id="availability-section" className="scroll-mt-24">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">Select Resource Type</h2>
                      <p className="text-sm text-muted-foreground">
                        Choose the workspace that fits your needs
                      </p>
                    </div>
                    <ResourceSelector
                      selectedResource={selectedResource}
                      onResourceSelect={(resource) => {
                        setSelectedResource(resource)
                        // Reset selections when changing resource type
                        setSelectedDate(null)
                        setSelectedTime(null)
                        setSelectedHalfDay(undefined)
                        setSelectedDuration("hourly")
                      }}
                    />
                  </div>
                </div>

                {/* Date Selection */}
                <AvailabilityCalendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  unavailableDates={unavailableDates}
                  datesWithBookings={datesWithBookings}
                  nextAvailable={nextAvailable}
                  resourceType={selectedResource || "hot-desk"}
                />

                {/* Time Selection */}
                {selectedResource && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">Select Time</h2>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred time slot
                      </p>
                    </div>
                    <TimeSelector
                      selectedTime={selectedTime}
                      selectedDuration={selectedDuration}
                      selectedHalfDay={selectedHalfDay}
                      onTimeSelect={setSelectedTime}
                      onDurationChange={(duration) => {
                        setSelectedDuration(duration)
                        // Reset half-day selection when changing duration
                        if (duration !== "half-day") {
                          setSelectedHalfDay(undefined)
                        }
                        // Reset time for full-day
                        if (duration === "full-day" && selectedResource === "hot-desk") {
                          setSelectedTime(null)
                        }
                      }}
                      onHalfDaySelect={setSelectedHalfDay}
                      availableSlots={availableSlots}
                      date={selectedDate}
                      resourceType={selectedResource || "hot-desk"}
                    />
                  </div>
                )}

                {/* Add-ons */}
                {isValidBooking && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">Add-ons</h2>
                      <p className="text-sm text-muted-foreground">
                        Enhance your workspace experience (optional)
                      </p>
                    </div>
                    <AddOnSelector
                      addOns={safePricing.addOns}
                      selectedAddOns={selectedAddOns}
                      onToggle={handleAddOnToggle}
                    />
                  </div>
                )}
              </div>

              {/* Right Column - Pricing & Summary (Desktop) */}
              <div className="lg:col-span-1 space-y-6">
                {isValidBooking && (
                  <PricingBreakdown
                    pricing={safePricing}
                    selectedDuration={selectedDuration}
                    selectedAddOns={selectedAddOns}
                    resourceType={selectedResource || "hot-desk"}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <AmenitiesGrid
                amenities={safeWorkspace.amenities}
                whoIsThisFor={safeWorkspace.whoIsThisFor}
              />
              <LocationSection workspace={safeWorkspace} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Sticky Booking Summary */}
        <StickyBookingSummary
          summary={{
            date: selectedDate,
            time: selectedTime,
            duration: selectedDuration,
            resourceType: selectedResource,
            addOns: selectedAddOns,
            totalPrice,
            currency: safePricing.currency,
          }}
          onClear={() => {
            setSelectedDate(null)
            setSelectedTime(null)
            setSelectedAddOns([])
          }}
          onConfirm={handleConfirmBooking}
          isBooking={isBooking}
          isValid={isValidBooking}
        />

        {/* WhatsApp Fallback - Mobile */}
        <div className="lg:hidden fixed bottom-20 right-4 z-40">
          <Button
            size="icon"
            className="rounded-full h-14 w-14 shadow-elevated bg-green-600 hover:bg-green-700"
            onClick={() => {
              window.open("https://wa.me/254700000000?text=Hi, I need help with booking", "_blank")
            }}
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
