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
import { ImageGallery } from "@/components/booking/image-gallery"
import { AddOnSelector } from "@/components/booking/add-on-selector"
import { StickyBookingSummary } from "@/components/booking/sticky-booking-summary"
import { Button } from "@/components/ui/button"
import { MessageCircle, Loader2 } from "lucide-react"

export default function BookingPage() {
  const workspaceId = "impact-hub-nairobi"
  
  // Hooks
  const { workspace, isLoading: isLoadingWorkspace } = useWorkspace(workspaceId)
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>("hot-desk")
  
  // Provide fallback values when workspace is null - Ikigai Space data
  const safeWorkspace = workspace || {
    id: workspaceId,
    name: "Ikigai Space - Impact Hub Nairobi",
    location: "Nairobi, Kenya",
    address: "Senteu Plaza, Galana Road, Kilimani, Nairobi",
    valueProposition: "A vibrant co-working space designed for social entrepreneurs and innovators. Experience a collaborative environment with modern amenities, networking opportunities, and a supportive community focused on creating positive impact.",
    startingPrice: 2500,
    currency: "KES",
    rating: 4.8,
    reviewCount: 127,
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80",
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80",
    ],
    amenities: [
      { icon: "wifi", label: "High-Speed WiFi", value: "100 Mbps" },
      { icon: "power", label: "Power Outlets", value: "At every desk" },
      { icon: "coffee", label: "Coffee & Tea", value: "Complimentary" },
      { icon: "community", label: "Community", value: "Networking events" },
      { icon: "noise", label: "Noise Level", value: "Quiet zones available" },
      { icon: "accessibility", label: "Accessibility", value: "Wheelchair accessible" },
    ],
    whoIsThisFor: "Perfect for entrepreneurs, freelancers, remote workers, startups, and social innovators looking for a professional workspace with a vibrant community.",
    openingHours: "Monday - Friday: 8:00 AM - 8:00 PM | Saturday: 9:00 AM - 5:00 PM | Sunday: Closed",
    houseRules: [
      "Respect quiet zones and maintain a professional environment",
      "Clean up after yourself and keep shared spaces tidy",
      "No smoking inside the premises",
      "Be mindful of noise levels during calls",
      "Follow security protocols and badge in/out",
    ],
    securityInfo: "24/7 security, CCTV surveillance, secure access with key cards, and on-site security personnel during business hours.",
    coordinates: { lat: -1.2921, lng: 36.8219 },
    landmarks: ["Kilimani Shopping Centre", "Yaya Centre", "Nairobi Hospital", "University of Nairobi"],
    companyLogos: ["Ikigai", "Impact Hub", "Social Enterprise"],
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

  // Proceed to payment (booking is confirmed only after payment on /booking/payment)
  const handleConfirmBooking = () => {
    if (!isValidBooking || !selectedDate || !selectedResource) {
      toast.warning("Complete your selection", "Please complete all required fields")
      return
    }

    if (selectedResource !== "hot-desk" || selectedDuration === "hourly") {
      if (!selectedTime) {
        toast.warning("Complete your selection", "Please select a time")
        return
      }
    }

    const startTime = calculateStartTime
    if (!startTime) {
      toast.warning("Complete your selection", "Please select a time")
      return
    }

    const basePrice = safePricing.options.find(opt => opt.type === selectedDuration)?.price ?? 0
    const addOnsPrice = selectedAddOns.reduce((sum, id) => {
      const addOn = safePricing.addOns.find(a => a.id === id)
      return sum + (addOn?.price || 0)
    }, 0)

    const payload = {
      resourceType: selectedResource,
      date: selectedDate.toISOString(),
      startTime,
      duration: selectedDuration,
      basePrice,
      addOnsPrice,
      totalPrice,
      addOns: selectedAddOns,
      workspaceId,
    }

    try {
      sessionStorage.setItem("pendingWorkspaceBooking", JSON.stringify(payload))
      window.location.href = "/booking/payment"
    } catch (e) {
      console.error("[BOOKING PAGE] Failed to save pending booking:", e)
      toast.error("Something went wrong", "Please try again.")
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

        {/* Main Booking Content */}
        <div className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Selection */}
            <div className="lg:col-span-2 space-y-8">
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
                {/* Venue Estimate - Always Visible */}
                <PricingBreakdown
                  pricing={safePricing}
                  selectedDuration={selectedDuration}
                  selectedAddOns={selectedAddOns}
                  resourceType={selectedResource || "hot-desk"}
                />

                {/* Confirm Booking Button - Desktop - Always visible when valid */}
                {isValidBooking && (
                  <Button
                    size="lg"
                    className="w-full button-press"
                    onClick={handleConfirmBooking}
                  >
                    Proceed to payment
                  </Button>
                )}
              </div>
            </div>
          </div>

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
          isBooking={false}
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
