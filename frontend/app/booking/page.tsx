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
  const { workspace } = useWorkspace(workspaceId)
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>("hot-desk")
  const { 
    slots, 
    unavailableDates, 
    nextAvailable, 
    selectedDate, 
    setSelectedDate 
  } = useAvailability(workspaceId, selectedResource || undefined)
  
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<BookingDuration>("hourly")
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [isBooking, setIsBooking] = useState(false)
  const [activeTab, setActiveTab] = useState("book")

  const { pricing, calculateTotal } = usePricing(
    workspaceId,
    selectedResource || "hot-desk",
    selectedDate || undefined,
    selectedDuration === "hourly" ? 1 : selectedDuration === "half-day" ? 4 : 8
  )

  // Calculate pricing
  const totalPrice = useMemo(() => {
    if (!selectedDate || !selectedTime || !selectedResource) return 0
    
    const basePrice = pricing.options.find(opt => opt.type === selectedDuration)?.price || 0
    const addOnsPrice = selectedAddOns.reduce((sum, id) => {
      const addOn = pricing.addOns.find(a => a.id === id)
      return sum + (addOn?.price || 0)
    }, 0)
    
    return basePrice + addOnsPrice
  }, [selectedDate, selectedTime, selectedResource, selectedDuration, selectedAddOns, pricing])

  // Check if booking is valid
  const isValidBooking = useMemo(() => {
    return !!(
      selectedDate &&
      selectedTime &&
      selectedResource &&
      totalPrice > 0
    )
  }, [selectedDate, selectedTime, selectedResource, totalPrice])

  // Handle booking
  const handleConfirmBooking = async () => {
    if (!isValidBooking || !selectedDate || !selectedTime || !selectedResource) {
      toast.warning("Complete your selection", "Please select date, time, and resource")
      return
    }

    setIsBooking(true)
    
    try {
      console.log("[BOOKING PAGE] Submitting booking:", {
        resourceType: selectedResource,
        date: selectedDate.toISOString(),
        startTime: selectedTime,
        duration: selectedDuration,
        basePrice: pricing.options.find(opt => opt.type === selectedDuration)?.price || 0,
        addOnsPrice: selectedAddOns.reduce((sum, id) => {
          const addOn = pricing.addOns.find(a => a.id === id)
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
          startTime: selectedTime,
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
          <BookingHeader
            workspace={workspace}
            onBookNow={handleCheckAvailability}
            onCheckAvailability={handleCheckAvailability}
          />

          {/* Image Gallery */}
          <ImageGallery images={workspace.images} spaceName={workspace.name} />
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
                      onResourceSelect={setSelectedResource}
                    />
                  </div>
                </div>

                {/* Date Selection */}
                <AvailabilityCalendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  unavailableDates={unavailableDates}
                  nextAvailable={nextAvailable}
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
                      onTimeSelect={setSelectedTime}
                      onDurationChange={setSelectedDuration}
                      availableSlots={availableSlots}
                      date={selectedDate}
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
                      addOns={pricing.addOns}
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
                    pricing={pricing}
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
                amenities={workspace.amenities}
                whoIsThisFor={workspace.whoIsThisFor}
              />
              <LocationSection workspace={workspace} />
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
            currency: pricing.currency,
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
