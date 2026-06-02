"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { MobileBreadcrumbsHidden } from "@/components/mobile/mobile-page-shell"
import { HUB_CONTACT_EMAIL } from "@/lib/hub-contact"
import { toast } from "@/lib/toast"
import { localCalendarDayToISO } from "@/lib/date-booking"
import { useWorkspace } from "@/lib/hooks/use-workspace"
import { useAvailability } from "@/lib/hooks/use-availability"
import { usePricing } from "@/lib/hooks/use-pricing"
import { BookingHeader } from "@/components/booking/booking-header"
import { BookingStep } from "@/components/booking/booking-step"
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

  const showBookingSidebar =
    selectedResource !== "private-office" && selectedResource !== "event-space"

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-5 pb-28 lg:space-y-6 lg:pb-10">
        <MobileBreadcrumbsHidden>
          <Breadcrumbs items={[{ label: "Book Workspace" }]} />
        </MobileBreadcrumbsHidden>

        {isLoadingWorkspace ? (
          <div className="flex justify-center py-16">
            <p className="text-sm text-muted-foreground">Loading workspace…</p>
          </div>
        ) : !workspace ? (
          <div className="rounded-xl border border-border bg-muted/20 px-6 py-12 text-center">
            <p className="font-medium">No active workspace configured</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create an active workspace in the admin panel to enable bookings.
            </p>
            {workspaceError ? (
              <p className="mt-2 text-xs text-destructive">{workspaceError}</p>
            ) : null}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
              <BookingHeader
                workspace={workspace}
                onBookNow={handleCheckAvailability}
              />
              <ImageGallery
                images={workspace.images}
                spaceName={workspace.name}
                compact
                className="w-full shrink-0 lg:max-w-[280px] xl:max-w-[320px]"
              />
            </div>

            <div
              className={
                showBookingSidebar
                  ? "grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:gap-8"
                  : "max-w-2xl"
              }
            >
              <div className="min-w-0 space-y-4 sm:space-y-5">
                <BookingStep
                  id="availability-section"
                  step={1}
                  title="Choose your space"
                  description="Pick a resource to see availability and pricing."
                >
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
                </BookingStep>

                {selectedResource === "private-office" && (
                  <BookingStep step={2} title="Request a private office">
                    <PrivateOfficeInquiryForm
                      workspaceId={workspaceId}
                      workspaceName={workspace?.name}
                    />
                  </BookingStep>
                )}

                {selectedResource === "event-space" && (
                  <BookingStep step={2} title="Event space inquiry">
                    <EventSpaceInquiryForm
                      workspaceId={workspaceId}
                      workspaceName={workspace?.name}
                    />
                  </BookingStep>
                )}

                {selectedResource === "meeting-room" && (
                  <BookingStep
                    step={2}
                    title="Room size & duration"
                    description="Capacity and hours for your meeting."
                  >
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
                  </BookingStep>
                )}

                {selectedResource &&
                  selectedResource !== "private-office" &&
                  selectedResource !== "event-space" && (
                    <BookingStep
                      step={selectedResource === "meeting-room" ? 3 : 2}
                      title="Pick a date"
                      description={
                        selectedResource === "meeting-room"
                          ? "Choose an available day after selecting room size."
                          : "Unavailable days are disabled."
                      }
                    >
                      {selectedResource === "meeting-room" && !selectedMeetingRoomCapacity ? (
                        <p className="text-sm text-muted-foreground">
                          Select room capacity in step 2 first.
                        </p>
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
                    </BookingStep>
                  )}

                {selectedResource === "meeting-room" && selectedMeetingRoomCapacity && (
                  <BookingStep step={4} title="Start time" description="Available slots for your date.">
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
                  </BookingStep>
                )}

                {selectedResource === "hot-desk" && selectedDate && (
                  <p className="text-sm text-muted-foreground px-1">
                    Hot desk is <span className="font-medium text-foreground">full-day</span> from 09:00.
                  </p>
                )}

                {isValidBooking && (
                  <BookingStep
                    step={selectedResource === "meeting-room" ? 5 : 3}
                    title="Add-ons"
                    description="Optional extras for your booking."
                  >
                    <AddOnSelector
                        addOns={safePricing.addOns}
                        selectedAddOns={selectedAddOns}
                        onToggle={handleAddOnToggle}
                      />
                    {selectedAddOns.includes("pastries") && (
                      <div className="mt-4 max-w-xs space-y-2">
                        <Label htmlFor="pastries-pax">Guests (PAX)</Label>
                        <Input
                          id="pastries-pax"
                          type="number"
                          min={1}
                          value={pastriesPax}
                          onChange={(e) => setPastriesPax(Number(e.target.value) || 1)}
                        />
                      </div>
                    )}
                  </BookingStep>
                )}
              </div>

              {showBookingSidebar && (
                <aside className="hidden lg:block">
                  <div className="sticky top-24 space-y-4">
                    <PricingBreakdown
                      compact
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
                    {isValidBooking ? (
                      <Button size="lg" className="w-full" onClick={handleConfirmBooking}>
                        Review & confirm
                      </Button>
                    ) : (
                      <p className="text-center text-xs text-muted-foreground">
                        Complete the steps to continue
                      </p>
                    )}
                  </div>
                </aside>
              )}
            </div>

            {showBookingSidebar && (
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

            <p className="text-center text-xs text-muted-foreground lg:hidden">
              Questions?{" "}
              <a
                href={`mailto:${HUB_CONTACT_EMAIL}?subject=Workspace%20booking%20support`}
                className="text-foreground underline underline-offset-2"
              >
                Email the team
              </a>
            </p>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
