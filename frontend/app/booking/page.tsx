"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { toast } from "@/lib/toast"
import { localCalendarDayToISO } from "@/lib/date-booking"
import { useWorkspace } from "@/lib/hooks/use-workspace"
import { useAvailability } from "@/lib/hooks/use-availability"
import { usePricing } from "@/lib/hooks/use-pricing"
import { BookingHeader } from "@/components/booking/booking-header"
import { AvailabilityCalendar } from "@/components/booking/availability-calendar"
import { TimeSelector, type BookingDuration } from "@/components/booking/time-selector"
import { ResourceSelector, type ResourceType } from "@/components/booking/resource-selector"
import { MeetingRoomSelector, type MeetingRoomCapacity } from "@/components/booking/meeting-room-selector"
import { PrivateOfficeInquiryForm } from "@/components/booking/private-office-inquiry-form"
import { EventSpaceInquiryForm } from "@/components/booking/event-space-inquiry-form"
import { PricingBreakdown } from "@/components/booking/pricing-breakdown"
import { ImageGallery } from "@/components/booking/image-gallery"
import { AddOnSelector } from "@/components/booking/add-on-selector"
import { StickyBookingSummary } from "@/components/booking/sticky-booking-summary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function BookingPage() {
  // Hooks
  // By default we load the first active workspace configured
  // in the admin Workspaces screen.
  const { workspace, isLoading: isLoadingWorkspace, error: workspaceError } = useWorkspace()

  // Use the real workspace id once loaded so bookings,
  // availability and pricing are tied to the admin record.
  const workspaceId = workspace?.id ?? "impact-hub-nairobi"
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>("hot-desk")
  // Hot desk defaults to full-day; private office defaults to monthly
  const getDefaultDuration = (resource: ResourceType | null): BookingDuration => {
    if (resource === "hot-desk") return "full-day"
    return "hourly"
  }

  const getMeetingRoomHourlyPrice = (capacity: MeetingRoomCapacity): number => {
    const mr = workspace?.pricing?.["meeting-room"] as Record<string, number> | undefined
    const price = mr?.[capacity]
    return typeof price === "number" && price > 0 ? price : { "1-4": 5000, "1-10": 8000, "1-35": 12000 }[capacity]
  }
  
  const availabilityResourceType =
    selectedResource === "event-space" ? undefined : (selectedResource || undefined)

  const { 
    slots, 
    unavailableDates,
    datesWithBookings,
    nextAvailable, 
    selectedDate, 
    setSelectedDate,
    isLoadingSlots,
  } = useAvailability(workspaceId, availabilityResourceType)
  
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<BookingDuration>("full-day")
  const [selectedHalfDay, setSelectedHalfDay] = useState<"morning" | "afternoon" | undefined>(undefined)
  const [selectedMeetingRoomCapacity, setSelectedMeetingRoomCapacity] = useState<MeetingRoomCapacity | null>(null)
  const [selectedMeetingRoomHours, setSelectedMeetingRoomHours] = useState(1)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [pastriesPax, setPastriesPax] = useState(1)

  const { pricing, calculateTotal } = usePricing(
    workspaceId,
    selectedResource || "hot-desk",
    selectedDate || undefined,
    selectedDuration === "hourly" ? 1 : selectedDuration === "half-day" ? 4 : selectedDuration === "monthly" ? 1 : 8
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
    if (!selectedResource) return 0
    
    // Private office: no booking price (inquiry only)
    if (selectedResource === "private-office" || selectedResource === "event-space") return 0
    
    if (!selectedDate) return 0
    
    let hasRequiredSelections = false
    let basePrice = 0
    
    if (selectedResource === "hot-desk") {
      if (selectedDuration === "full-day") {
        hasRequiredSelections = true
        basePrice = safePricing.options.find(opt => opt.type === "full-day")?.price || 0
      } else if (selectedDuration === "half-day") {
        hasRequiredSelections = !!selectedHalfDay
        basePrice = safePricing.options.find(opt => opt.type === "half-day")?.price || 0
      } else {
        hasRequiredSelections = !!selectedTime
        basePrice = safePricing.options.find(opt => opt.type === "hourly")?.price || 0
      }
    } else if (selectedResource === "meeting-room") {
      hasRequiredSelections = !!selectedMeetingRoomCapacity && selectedMeetingRoomHours > 0 && !!selectedTime
      if (selectedMeetingRoomCapacity) {
        basePrice = getMeetingRoomHourlyPrice(selectedMeetingRoomCapacity) * selectedMeetingRoomHours
      }
    }
    
    if (!hasRequiredSelections) return 0
    
    const addOnsPrice = selectedAddOns.reduce((sum, id) => {
      const addOn = safePricing.addOns.find(a => a.id === id)
      if (!addOn) return sum
      if (id === "pastries") return sum + (addOn.price || 0) * Math.max(1, pastriesPax)
      return sum + (addOn.price || 0)
    }, 0)
    
    return basePrice + addOnsPrice
  }, [
    selectedDate,
    selectedTime,
    selectedResource,
    selectedDuration,
    selectedHalfDay,
    selectedMeetingRoomCapacity,
    selectedMeetingRoomHours,
    selectedAddOns,
    safePricing,
    workspace?.pricing,
    pastriesPax,
  ])

  // Check if booking is valid
  const isValidBooking = useMemo(() => {
    if (!selectedResource) return false
    // Private office: inquiry flow, not booking
    if (selectedResource === "private-office" || selectedResource === "event-space") return false
    if (!selectedDate || !Number.isFinite(totalPrice) || totalPrice <= 0) return false
    
    // Hot desk: full-day only
    if (selectedResource === "hot-desk") {
      return selectedDuration === "full-day"
    }
    // Meeting room: capacity + hours + date + time
    if (selectedResource === "meeting-room") {
      return !!selectedMeetingRoomCapacity && selectedMeetingRoomHours > 0 && !!selectedTime
    }
    return false
  }, [selectedDate, selectedTime, selectedResource, selectedDuration, selectedMeetingRoomCapacity, selectedMeetingRoomHours, totalPrice])

  // Calculate start time based on duration and selection
  const calculateStartTime = useMemo(() => {
    if (selectedResource === "hot-desk" && selectedDuration === "full-day") return "09:00"
    if (selectedResource === "hot-desk" && selectedDuration === "half-day" && selectedHalfDay) {
      return selectedHalfDay === "morning" ? "09:00" : "13:00"
    }
    return selectedTime || null
  }, [selectedResource, selectedDuration, selectedHalfDay, selectedTime])

  // Proceed to confirmation/payment step. Booking can be created with paymentStatus pending.
  const handleConfirmBooking = () => {
    if (!isValidBooking || !selectedDate || !selectedResource) {
      toast.warning("Complete your selection", "Please complete all required fields")
      return
    }

    // Only meeting rooms need explicit time selection
    if (selectedResource === "meeting-room" && !selectedTime) {
      toast.warning("Complete your selection", "Please select a time")
      return
    }

    const startTime = calculateStartTime
    if (!startTime) {
      toast.warning("Complete your selection", "Please select a time")
      return
    }

    const basePrice = selectedResource === "meeting-room" && selectedMeetingRoomCapacity
      ? getMeetingRoomHourlyPrice(selectedMeetingRoomCapacity) * selectedMeetingRoomHours
      : (safePricing.options.find(opt => opt.type === selectedDuration)?.price ?? 0)
    const addOnsPrice = selectedAddOns.reduce((sum, id) => {
      const addOn = safePricing.addOns.find(a => a.id === id)
      if (!addOn) return sum
      if (id === "pastries") return sum + (addOn.price || 0) * Math.max(1, pastriesPax)
      return sum + (addOn.price || 0)
    }, 0)

    const payload: Record<string, unknown> = {
      resourceType: selectedResource,
      date: localCalendarDayToISO(selectedDate),
      startTime,
      duration: selectedResource === "meeting-room" ? "hourly" : selectedDuration,
      basePrice,
      addOnsPrice,
      totalPrice,
      addOns: selectedAddOns,
      workspaceId,
    }
    if (selectedAddOns.includes("pastries")) {
      payload.pastriesPax = Math.max(1, pastriesPax)
    }
    if (selectedResource === "meeting-room" && selectedMeetingRoomCapacity) {
      payload.meetingRoomHours = selectedMeetingRoomHours
      payload.meetingRoomCapacity = selectedMeetingRoomCapacity
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
    return slots
      .filter((slot) => {
        const slotDate = new Date(slot.date)
        return (
          slotDate.getDate() === selectedDate.getDate() &&
          slotDate.getMonth() === selectedDate.getMonth() &&
          slotDate.getFullYear() === selectedDate.getFullYear()
        )
      })
      .map((slot) => ({
        time: slot.time,
        available: slot.available,
      }))
  }, [slots, selectedDate])

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
          ) : !workspace ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <p className="font-medium">No active workspace configured</p>
                <p className="text-sm text-muted-foreground">
                  Please create an active workspace in the admin panel to power this booking page.
                </p>
                {workspaceError && (
                  <p className="text-xs text-destructive">{workspaceError}</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <BookingHeader
                workspace={workspace}
                onBookNow={handleCheckAvailability}
                onCheckAvailability={handleCheckAvailability}
              />

              {/* Image Gallery */}
              <ImageGallery images={workspace.images} spaceName={workspace.name} />
            </>
          )}
        </div>

        {/* Main Booking Content */}
        {workspace && (
          <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left Column - Steps */}
              <div className="lg:col-span-2 space-y-8">
                {/* Step 1: Resource */}
                <div id="availability-section" className="scroll-mt-24 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Step 1
                      </p>
                      <h2 className="text-xl font-semibold tracking-tight">Choose your space</h2>
                      <p className="text-sm text-muted-foreground">
                        Pick a resource type to see availability and pricing.
                      </p>
                    </div>
                  </div>
                  <ResourceSelector
                    selectedResource={selectedResource}
                    onResourceSelect={(resource) => {
                      setSelectedResource(resource)
                      setSelectedDate(null)
                      setSelectedTime(null)
                      setSelectedHalfDay(undefined)
                      setSelectedMeetingRoomCapacity(null)
                      setSelectedMeetingRoomHours(1)
                      setSelectedAddOns([])
                      setPastriesPax(1)
                      setSelectedDuration(getDefaultDuration(resource))
                    }}
                    pricing={workspace?.pricing}
                    currency={workspace?.currency || "KES"}
                  />
                </div>

                  {/* Private Office: Inquiry form only */}
                  {selectedResource === "private-office" && (
                    <div className="space-y-4">
                      <PrivateOfficeInquiryForm
                        workspaceId={workspaceId}
                        workspaceName={workspace?.name}
                      />
                    </div>
                  )}

                  {/* Event space: inquiry (up to 70 PAX) */}
                  {selectedResource === "event-space" && (
                    <div className="space-y-4">
                      <EventSpaceInquiryForm
                        workspaceId={workspaceId}
                        workspaceName={workspace?.name}
                      />
                    </div>
                  )}

                  {/* Meeting Room: Capacity + Hours selector */}
                  {selectedResource === "meeting-room" && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Step 2
                        </p>
                        <h2 className="text-xl font-semibold tracking-tight mb-1">Room size & duration</h2>
                        <p className="text-sm text-muted-foreground">
                          Choose room size and number of hours
                        </p>
                      </div>
                      <MeetingRoomSelector
                        selectedCapacity={selectedMeetingRoomCapacity}
                        selectedHours={selectedMeetingRoomHours}
                        pricing={workspace?.pricing?.["meeting-room"] as Record<string, number> | undefined}
                        currency={workspace?.currency || "KES"}
                        onCapacitySelect={(c) => {
                          setSelectedMeetingRoomCapacity(c)
                          setSelectedDate(null)
                          setSelectedTime(null)
                        }}
                        onHoursChange={(h) => {
                          setSelectedMeetingRoomHours(h)
                          setSelectedTime(null)
                        }}
                      />
                    </div>
                  )}

                  {/* Date Selection - Hot desk & Meeting room */}
                  {selectedResource &&
                    selectedResource !== "private-office" &&
                    selectedResource !== "event-space" && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {selectedResource === "meeting-room" ? "Step 3" : "Step 2"}
                        </p>
                        <h2 className="text-xl font-semibold tracking-tight mb-1">Pick a date</h2>
                        <p className="text-sm text-muted-foreground">
                          {selectedResource === "meeting-room"
                            ? "Select room size first, then choose an available day."
                            : "Select an available day. Fully booked days are disabled."}
                        </p>
                      </div>
                      {selectedResource === "meeting-room" && !selectedMeetingRoomCapacity ? (
                        <div className="rounded-md border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                          Choose a room capacity above (Step 2) before picking a date — that keeps availability and
                          pricing aligned.
                        </div>
                      ) : (
                        <AvailabilityCalendar
                          selectedDate={selectedDate}
                          onDateSelect={(d) => {
                            setSelectedDate(d)
                            setSelectedTime(null)
                          }}
                          unavailableDates={unavailableDates}
                          datesWithBookings={datesWithBookings}
                          nextAvailable={nextAvailable}
                          resourceType={selectedResource || "hot-desk"}
                        />
                      )}
                    </div>
                  )}

                  {/* Time Selection - Meeting room (after capacity + date) */}
                  {selectedResource === "meeting-room" && selectedMeetingRoomCapacity && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Step 4
                        </p>
                        <h2 className="text-xl font-semibold tracking-tight mb-1">Choose a start time</h2>
                        <p className="text-sm text-muted-foreground">
                          Pick an available slot for your meeting room booking.
                        </p>
                      </div>
                      <TimeSelector
                        selectedTime={selectedTime}
                        selectedDuration={
                          selectedResource === "meeting-room"
                            ? "hourly"
                            : selectedDuration
                        }
                        selectedHalfDay={selectedHalfDay}
                        onTimeSelect={setSelectedTime}
                        onDurationChange={(duration) => {
                          setSelectedDuration(duration)
                          if (duration !== "half-day") setSelectedHalfDay(undefined)
                          if (duration === "full-day" && selectedResource === "hot-desk") {
                            setSelectedTime(null)
                          }
                        }}
                        onHalfDaySelect={setSelectedHalfDay}
                        availableSlots={availableSlots}
                        date={selectedDate}
                        resourceType={selectedResource || "hot-desk"}
                        hideDurationSelector={selectedResource === "meeting-room"}
                        slotsLoading={isLoadingSlots}
                      />
                    </div>
                  )}

                  {/* Hot desk: make it explicit this is full-day (no time pick) */}
                  {selectedResource === "hot-desk" && selectedDate && (
                    <div className="rounded-md border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                      Hot desk bookings are <span className="font-medium text-foreground">full-day</span> (starts at
                      09:00). You’ll confirm details on the next step.
                    </div>
                  )}

                  {/* Add-ons */}
                  {isValidBooking && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {selectedResource === "meeting-room" ? "Step 5" : "Step 3"}
                        </p>
                        <h2 className="text-xl font-semibold tracking-tight mb-1">Add-ons (optional)</h2>
                        <p className="text-sm text-muted-foreground">
                          Enhance your workspace experience (optional)
                        </p>
                      </div>
                      <AddOnSelector
                        addOns={safePricing.addOns}
                        selectedAddOns={selectedAddOns}
                        onToggle={handleAddOnToggle}
                      />
                      {selectedAddOns.includes("pastries") && (
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="pastries-pax">How many people (PAX)?</Label>
                            <Input
                              id="pastries-pax"
                              type="number"
                              min={1}
                              value={pastriesPax}
                              onChange={(e) => setPastriesPax(Number(e.target.value) || 1)}
                            />
                          </div>
                          <div className="rounded-md border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                            You can request a customized menu in the notes on the next step.
                          </div>
                        </div>
                      )}
                      {isValidBooking && (
                        <div className="pt-2 lg:hidden">
                          <Button size="lg" className="w-full" onClick={handleConfirmBooking}>
                            Review & confirm
                          </Button>
                          <p className="text-xs text-center text-muted-foreground mt-2">
                            Or use the bar at the bottom of the screen.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column - Pricing & Summary (Desktop) - Hidden for private office */}
                {selectedResource !== "private-office" && selectedResource !== "event-space" && (
                  <div className="lg:col-span-1 space-y-6">
                    <PricingBreakdown
                      pricing={safePricing}
                      selectedDuration={selectedDuration}
                      selectedAddOns={selectedAddOns}
                      resourceType={selectedResource || "hot-desk"}
                      meetingRoomCapacity={selectedMeetingRoomCapacity}
                      meetingRoomHours={selectedMeetingRoomHours}
                      meetingRoomHourlyPrice={
                        selectedMeetingRoomCapacity
                          ? getMeetingRoomHourlyPrice(selectedMeetingRoomCapacity)
                          : undefined
                      }
                      currency={safePricing.currency}
                      pastriesPax={pastriesPax}
                    />

                    {isValidBooking && (
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={handleConfirmBooking}
                      >
                        Review & confirm
                      </Button>
                    )}
                  </div>
                )}
              </div>

          {/* Sticky Booking Summary - Hidden for private office */}
          {selectedResource !== "private-office" && selectedResource !== "event-space" && (
          <StickyBookingSummary
            summary={{
              date: selectedDate,
              time: selectedTime,
              duration: selectedResource === "meeting-room" ? "hourly" : selectedDuration,
              resourceType: selectedResource,
              addOns: selectedAddOns,
              totalPrice,
              currency: safePricing.currency,
              meetingRoomCapacity: selectedMeetingRoomCapacity ?? undefined,
              meetingRoomHours: selectedMeetingRoomHours,
            }}
            onClear={() => {
              setSelectedDate(null)
              setSelectedTime(null)
              setSelectedMeetingRoomCapacity(null)
              setSelectedMeetingRoomHours(1)
              setSelectedAddOns([])
            }}
            onConfirm={handleConfirmBooking}
            isBooking={false}
            isValid={isValidBooking}
            showDesktop={false}
          />
          )}

          <p className="text-center text-xs text-muted-foreground lg:hidden pb-4">
            Need help with booking?{" "}
            <a
              href="mailto:nairobi@impacthub.net?subject=Workspace%20booking%20support"
              className="text-foreground underline underline-offset-2"
            >
              Email the team
            </a>
          </p>
        </div>
        )}
      </div>
    </DashboardLayout>
  )
}
