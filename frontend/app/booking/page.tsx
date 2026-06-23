"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { CheckoutGuideStrip } from "@/components/booking/checkout-guide-strip"
import { StickyBookingSummary } from "@/components/booking/sticky-booking-summary"
import { WorkspacePicker } from "@/components/booking/workspace-picker"
import { getCheckoutGuideHint, isBookableForCheckout } from "@/lib/checkout-guide-hint"
import { useMembershipBenefits } from "@/lib/hooks/use-membership"
import {
  applyMembershipBookingBenefits,
  describeMeetingRoomBenefit,
} from "@/lib/membership-booking-benefits"
import { resolveAllowanceState, parseMembershipTier } from "@/lib/membership-tier"
import { MembershipTierBadge } from "@/components/membership-tier-badge"
import { useWorkspaces } from "@/lib/hooks/use-workspaces"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

function BookingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const slugParam = searchParams.get("slug")

  const { workspaces, isLoading: isLoadingList } = useWorkspaces()

  useEffect(() => {
    if (isLoadingList || slugParam || workspaces.length !== 1) return
    router.replace(`/booking?slug=${encodeURIComponent(workspaces[0].slug)}`, { scroll: false })
  }, [isLoadingList, slugParam, workspaces, router])

  const needsPicker = !isLoadingList && workspaces.length > 1 && !slugParam
  const effectiveSlug =
    slugParam ?? (workspaces.length === 1 ? workspaces[0]?.slug : undefined)

  const {
    workspace,
    isLoading: isLoadingWorkspace,
    error: workspaceError,
  } = useWorkspace(needsPicker ? null : effectiveSlug)

  const selectWorkspace = (slug: string) => {
    router.push(`/booking?slug=${encodeURIComponent(slug)}`, { scroll: false })
  }

  const workspaceId = workspace?.id
  const { membership } = useMembershipBenefits()
  const hiddenResourceTypes: ResourceType[] =
    membership && !membership.canBookHotDesk ? ["hot-desk"] : []

  const [selectedResource, setSelectedResource] = useState<ResourceType | null>("hot-desk")

  useEffect(() => {
    if (!membership || membership.canBookHotDesk) return
    if (selectedResource === "hot-desk") {
      setSelectedResource("meeting-room")
      setSelectedDuration("hourly")
      setSelectedDate(null)
      setSelectedTime(null)
    }
  }, [membership, selectedResource])

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
  } = useAvailability(workspaceId ?? "", availabilityResourceType)

  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<BookingDuration>("full-day")
  const [selectedHalfDay, setSelectedHalfDay] = useState<"morning" | "afternoon" | undefined>(undefined)
  const [selectedMeetingRoomCapacity, setSelectedMeetingRoomCapacity] = useState<MeetingRoomCapacity | null>(null)
  const [selectedMeetingRoomHours, setSelectedMeetingRoomHours] = useState(1)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [pastriesPax, setPastriesPax] = useState(1)

  const { pricing } = usePricing(
    workspaceId,
    selectedResource || "hot-desk",
    selectedDate || undefined,
    selectedDuration === "hourly" ? 1 : selectedDuration === "half-day" ? 4 : selectedDuration === "monthly" ? 1 : 8,
    workspace
      ? {
          pricing: workspace.pricing,
          currency: workspace.currency,
          startingPrice: workspace.startingPrice,
        }
      : null
  )

  const safePricing = pricing || {
    basePrice: 0,
    currency: "KES",
    options: [],
    addOns: [],
  }

  const bookingPricing = useMemo(() => {
    if (!selectedResource) return { grossTotal: 0, totalPrice: 0, membershipDiscount: 0, ready: false }
    if (selectedResource === "private-office" || selectedResource === "event-space") {
      return { grossTotal: 0, totalPrice: 0, membershipDiscount: 0, ready: false }
    }
    if (!selectedDate) return { grossTotal: 0, totalPrice: 0, membershipDiscount: 0, ready: false }

    let hasRequiredSelections = false
    let basePrice = 0

    if (selectedResource === "hot-desk") {
      if (selectedDuration === "full-day") {
        hasRequiredSelections = true
        basePrice = safePricing.options.find((opt) => opt.type === "full-day")?.price || 0
      } else if (selectedDuration === "half-day") {
        hasRequiredSelections = !!selectedHalfDay
        basePrice = safePricing.options.find((opt) => opt.type === "half-day")?.price || 0
      } else {
        hasRequiredSelections = !!selectedTime
        basePrice = safePricing.options.find((opt) => opt.type === "hourly")?.price || 0
      }
    } else if (selectedResource === "meeting-room") {
      hasRequiredSelections =
        !!selectedMeetingRoomCapacity && selectedMeetingRoomHours > 0 && !!selectedTime
      if (selectedMeetingRoomCapacity) {
        basePrice = getMeetingRoomHourlyPrice(selectedMeetingRoomCapacity) * selectedMeetingRoomHours
      }
    }

    if (!hasRequiredSelections) {
      return { grossTotal: 0, totalPrice: 0, membershipDiscount: 0, ready: false }
    }

    const addOnsPrice =
      selectedResource === "meeting-room"
        ? selectedAddOns.reduce((sum, id) => {
            const addOn = safePricing.addOns.find((a) => a.id === id)
            if (!addOn) return sum
            if (id === "pastries") return sum + (addOn.price || 0) * Math.max(1, pastriesPax)
            return sum + (addOn.price || 0)
          }, 0)
        : 0

    const tier = parseMembershipTier(membership?.tier ?? null)
    const allowance = membership
      ? resolveAllowanceState({
          tier,
          meetingRoomFreeMinutesUsed: membership.meetingRoom.usedMinutes,
          meetingRoomAllowancePeriodStart: new Date(membership.meetingRoom.periodStart),
        })
      : resolveAllowanceState({
          tier: null,
          meetingRoomFreeMinutesUsed: 0,
          meetingRoomAllowancePeriodStart: null,
        })

    const priced = applyMembershipBookingBenefits({
      tier,
      allowance,
      resourceType: selectedResource,
      meetingRoomHours: selectedMeetingRoomHours,
      basePrice,
      addOnsPrice,
    })

    return {
      grossTotal: priced.listPrice,
      totalPrice: priced.totalPrice,
      membershipDiscount: priced.membershipDiscount,
      ready: true,
    }
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
    membership,
  ])

  const totalPrice = bookingPricing.totalPrice
  const membershipDiscount = bookingPricing.membershipDiscount
  const meetingRoomBenefitHint = membership
    ? describeMeetingRoomBenefit(
        parseMembershipTier(membership.tier),
        resolveAllowanceState({
          tier: parseMembershipTier(membership.tier),
          meetingRoomFreeMinutesUsed: membership.meetingRoom.usedMinutes,
          meetingRoomAllowancePeriodStart: new Date(membership.meetingRoom.periodStart),
        })
      )
    : null

  const isValidBooking = useMemo(() => {
    if (!selectedResource) return false
    if (selectedResource === "private-office" || selectedResource === "event-space") return false
    if (!selectedDate || !bookingPricing.ready) return false
    if (!Number.isFinite(totalPrice) || totalPrice < 0) return false
    if (totalPrice === 0 && membershipDiscount <= 0) return false
    if (selectedResource === "hot-desk") return selectedDuration === "full-day"
    if (selectedResource === "meeting-room") {
      return !!selectedMeetingRoomCapacity && selectedMeetingRoomHours > 0 && !!selectedTime
    }
    return false
  }, [
    selectedDate,
    selectedTime,
    selectedResource,
    selectedDuration,
    selectedMeetingRoomCapacity,
    selectedMeetingRoomHours,
    totalPrice,
    membershipDiscount,
    bookingPricing.ready,
  ])

  const calculateStartTime = useMemo(() => {
    if (selectedResource === "hot-desk" && selectedDuration === "full-day") return "09:00"
    if (selectedResource === "hot-desk" && selectedDuration === "half-day" && selectedHalfDay) {
      return selectedHalfDay === "morning" ? "09:00" : "13:00"
    }
    return selectedTime || null
  }, [selectedResource, selectedDuration, selectedHalfDay, selectedTime])

  const handleConfirmBooking = () => {
    if (!workspace?.id) {
      toast.error("Workspace unavailable", "Please refresh and try again.")
      return
    }
    if (!isValidBooking || !selectedDate || !selectedResource) {
      toast.warning("Complete your selection", "Choose your space, date, and time.")
      return
    }

    if (selectedResource === "meeting-room" && !selectedTime) {
      toast.warning("Complete your selection", "Please select a time.")
      return
    }

    const startTime = calculateStartTime
    if (!startTime) {
      toast.warning("Complete your selection", "Please select a time.")
      return
    }

    const basePrice =
      selectedResource === "meeting-room" && selectedMeetingRoomCapacity
        ? getMeetingRoomHourlyPrice(selectedMeetingRoomCapacity) * selectedMeetingRoomHours
        : (safePricing.options.find((opt) => opt.type === selectedDuration)?.price ?? 0)
    const meetingRoomAddOns =
      selectedResource === "meeting-room" ? selectedAddOns : []
    const addOnsPrice =
      meetingRoomAddOns.length > 0
        ? meetingRoomAddOns.reduce((sum, id) => {
            const addOn = safePricing.addOns.find((a) => a.id === id)
            if (!addOn) return sum
            if (id === "pastries") return sum + (addOn.price || 0) * Math.max(1, pastriesPax)
            return sum + (addOn.price || 0)
          }, 0)
        : 0

    const payload: Record<string, unknown> = {
      resourceType: selectedResource,
      date: localCalendarDayToISO(selectedDate),
      startTime,
      duration: selectedResource === "meeting-room" ? "hourly" : selectedDuration,
      basePrice,
      addOnsPrice,
      totalPrice,
      listPrice: bookingPricing.grossTotal,
      membershipDiscount,
      addOns: meetingRoomAddOns,
      workspaceId: workspace.id,
    }
    if (meetingRoomAddOns.includes("pastries")) {
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
    setSelectedAddOns((prev) =>
      prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]
    )
  }

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

  const isBookableResource =
    selectedResource === "hot-desk" || selectedResource === "meeting-room"

  const canPickDate =
    selectedResource === "hot-desk" ||
    (selectedResource === "meeting-room" && !!selectedMeetingRoomCapacity)

  const canPickTime =
    selectedResource === "meeting-room" && !!selectedDate && !!selectedMeetingRoomCapacity

  const canPickAddOns =
    selectedResource === "meeting-room" && !!selectedDate && !!selectedTime

  const showCheckoutGuide = isBookableForCheckout(selectedResource)
  const checkoutGuideHint = getCheckoutGuideHint({
    resource: selectedResource,
    isValid: isValidBooking,
    selectedDate,
    selectedTime,
    meetingRoomCapacity: selectedMeetingRoomCapacity,
  })

  return (
    <DashboardLayout>
      <div
        className={cn(
          "mx-auto w-full max-w-6xl space-y-6 overflow-x-hidden lg:pb-10",
          isBookableResource
            ? "pb-[calc(11.5rem+env(safe-area-inset-bottom))] lg:pb-10"
            : "pb-6"
        )}
      >
        <MobileBreadcrumbsHidden>
          <Breadcrumbs items={[{ label: "Book Workspace" }]} />
        </MobileBreadcrumbsHidden>

        {isLoadingList || (isLoadingWorkspace && !needsPicker) ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/20 px-6 py-12 text-center">
            <p className="font-medium">No active workspace configured</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create an active workspace in the admin panel to enable bookings.
            </p>
          </div>
        ) : needsPicker ? (
          <WorkspacePicker
            workspaces={workspaces}
            selectedSlug={null}
            onSelect={selectWorkspace}
          />
        ) : !workspace ? (
          <div className="space-y-4">
            <WorkspacePicker
              workspaces={workspaces}
              selectedSlug={slugParam}
              onSelect={selectWorkspace}
            />
            <div className="rounded-xl border border-border bg-muted/20 px-6 py-8 text-center">
              <p className="font-medium">Workspace not found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Pick a workspace above, or check that it is marked active in admin.
              </p>
              {workspaceError ? (
                <p className="mt-2 text-xs text-destructive">{workspaceError}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            {workspaces.length > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                <span>
                  Booking: <span className="font-semibold">{workspace.name}</span>
                </span>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() => router.push("/booking", { scroll: false })}
                >
                  Change workspace
                </Button>
              </div>
            )}
            <div className="space-y-4">
              <ImageGallery
                images={workspace.images}
                spaceName={workspace.name}
                compact
                className="w-full"
              />
              <BookingHeader workspace={workspace} />
            </div>

            <div
              className={
                isBookableResource
                  ? "grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8"
                  : "max-w-2xl"
              }
            >
              <div className="min-w-0 space-y-5">
                <BookingStep
                  id="availability-section"
                  step={1}
                  title="Choose your space"
                  description="Pick a resource to see availability and pricing."
                >
                  {membership?.label ? (
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <MembershipTierBadge membership={membership} />
                      {!membership.canBookHotDesk ? (
                        <p className="text-xs text-muted-foreground">
                          Workspace access is included — book meeting rooms below.
                        </p>
                      ) : null}
                      {meetingRoomBenefitHint ? (
                        <p className="w-full text-xs text-muted-foreground">
                          {meetingRoomBenefitHint}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <ResourceSelector
                    selectedResource={selectedResource}
                    hiddenResourceTypes={hiddenResourceTypes}
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

                {isBookableResource && (
                  <>
                    {selectedResource === "meeting-room" && (
                      <BookingStep
                        step={2}
                        title="Room size & duration"
                        description="Capacity and hours for your meeting."
                      >
                        <MeetingRoomSelector
                          selectedCapacity={selectedMeetingRoomCapacity}
                          selectedHours={selectedMeetingRoomHours}
                          pricing={
                            workspace?.pricing?.["meeting-room"] as
                              | Record<string, number>
                              | undefined
                          }
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

                    <BookingStep
                      step={selectedResource === "meeting-room" ? 3 : 2}
                      title="Pick a date"
                      description="Unavailable days are disabled on the calendar."
                    >
                      <div
                        className={cn(!canPickDate && "pointer-events-none opacity-50")}
                        aria-disabled={!canPickDate}
                      >
                        {!canPickDate ? (
                          <p className="mb-3 text-sm text-muted-foreground">
                            Select a room size first.
                          </p>
                        ) : null}
                        <AvailabilityCalendar
                          selectedDate={selectedDate}
                          onDateSelect={(d) => {
                            setSelectedDate(d)
                            setSelectedTime(null)
                          }}
                          unavailableDates={unavailableDates}
                          datesWithBookings={datesWithBookings}
                          nextAvailable={nextAvailable}
                          resourceType={selectedResource}
                        />
                      </div>
                    </BookingStep>

                    {selectedResource === "meeting-room" && (
                      <BookingStep
                        step={4}
                        title="Start time"
                        description="Available slots for your selected day."
                      >
                        <div
                          className={cn(!canPickTime && "pointer-events-none opacity-50")}
                          aria-disabled={!canPickTime}
                        >
                          {!canPickTime ? (
                            <p className="mb-3 text-sm text-muted-foreground">
                              Choose a date to see time slots.
                            </p>
                          ) : null}
                          <TimeSelector
                            selectedTime={selectedTime}
                            selectedDuration="hourly"
                            selectedHalfDay={selectedHalfDay}
                            onTimeSelect={setSelectedTime}
                            onDurationChange={(duration) => {
                              setSelectedDuration(duration)
                              if (duration !== "half-day") setSelectedHalfDay(undefined)
                            }}
                            onHalfDaySelect={setSelectedHalfDay}
                            availableSlots={availableSlots}
                            date={selectedDate}
                            resourceType="meeting-room"
                            hideDurationSelector
                            slotsLoading={isLoadingSlots}
                          />
                        </div>
                      </BookingStep>
                    )}

                    {selectedResource === "hot-desk" && selectedDate && (
                      <p className="px-1 text-sm text-muted-foreground">
                        Hot desk bookings are <span className="font-medium text-foreground">full day</span> from 09:00.
                      </p>
                    )}

                    {selectedResource === "meeting-room" && (
                      <BookingStep
                        step={5}
                        title="Add-ons (optional)"
                        description="Extras you can add to your meeting room booking."
                      >
                        <div
                          className={cn(!canPickAddOns && "pointer-events-none opacity-50")}
                          aria-disabled={!canPickAddOns}
                        >
                          {!canPickAddOns ? (
                            <p className="mb-3 text-sm text-muted-foreground">
                              Complete date and time first.
                            </p>
                          ) : null}
                          <AddOnSelector
                            addOns={safePricing.addOns}
                            selectedAddOns={selectedAddOns}
                            onToggle={handleAddOnToggle}
                          />
                          {selectedAddOns.includes("pastries") && canPickAddOns && (
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
                        </div>
                      </BookingStep>
                    )}
                  </>
                )}
              </div>

              {isBookableResource && (
                <aside className="hidden lg:block">
                  <div className="sticky top-24 space-y-4">
                    <PricingBreakdown
                      compact
                      pricing={safePricing}
                      selectedDuration={selectedDuration}
                      selectedAddOns={
                        selectedResource === "meeting-room" ? selectedAddOns : []
                      }
                      resourceType={selectedResource}
                      meetingRoomCapacity={selectedMeetingRoomCapacity}
                      meetingRoomHours={selectedMeetingRoomHours}
                      meetingRoomHourlyPrice={
                        selectedMeetingRoomCapacity
                          ? getMeetingRoomHourlyPrice(selectedMeetingRoomCapacity)
                          : undefined
                      }
                      currency={safePricing.currency}
                      pastriesPax={pastriesPax}
                      membershipDiscount={membershipDiscount}
                    />
                    <Button
                      size="lg"
                      className="w-full"
                      disabled={!isValidBooking}
                      onClick={handleConfirmBooking}
                    >
                      {isValidBooking
                        ? totalPrice === 0
                          ? "Confirm free booking"
                          : "Continue to checkout"
                        : "Complete booking first"}
                    </Button>
                  </div>
                </aside>
              )}
            </div>

            {isBookableResource && showCheckoutGuide && (
              <section
                className="hidden space-y-4 border-t border-border pt-6 lg:block"
                aria-label="Checkout guide"
              >
                <CheckoutGuideStrip
                  ready={isValidBooking}
                  hint={checkoutGuideHint}
                  onCheckout={handleConfirmBooking}
                />
              </section>
            )}

            {isBookableResource && (
              <StickyBookingSummary
                summary={{
                  date: selectedDate,
                  time: selectedTime,
                  duration: selectedResource === "meeting-room" ? "hourly" : selectedDuration,
                  resourceType: selectedResource,
                  totalPrice,
                  listPrice: bookingPricing.grossTotal,
                  membershipDiscount,
                  currency: safePricing.currency,
                }}
                onConfirm={handleConfirmBooking}
                isBooking={false}
                isValid={isValidBooking}
                showGuide={showCheckoutGuide}
                guideReady={isValidBooking}
                guideHint={checkoutGuideHint}
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

function BookingPageFallback() {
  return (
    <DashboardLayout>
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </DashboardLayout>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingPageFallback />}>
      <BookingPageContent />
    </Suspense>
  )
}
