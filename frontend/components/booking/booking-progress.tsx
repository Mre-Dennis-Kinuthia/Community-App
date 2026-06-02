"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BookingFlowStep, BookingFlowStepId } from "@/lib/booking-flow"

interface BookingProgressProps {
  steps: BookingFlowStep[]
  currentStepId: BookingFlowStepId
  className?: string
}

export function BookingProgress({ steps, currentStepId, className }: BookingProgressProps) {
  const flowSteps = [...steps]
  const hasCheckout = !flowSteps.some((s) => s.id === "checkout")
  const displaySteps = hasCheckout
    ? [...flowSteps, { id: "checkout" as const, label: "Checkout" }]
    : flowSteps

  const currentIndex = displaySteps.findIndex((s) => s.id === currentStepId)

  return (
    <nav
      aria-label="Booking progress"
      className={cn(
        "w-full overflow-x-auto rounded-lg border border-border/60 bg-muted/20 px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      <ol className="flex min-w-max items-center">
        {displaySteps.map((step, index) => {
          const isComplete = index < currentIndex
          const isCurrent = step.id === currentStepId

          return (
            <li key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-1.5 py-0.5 sm:gap-2 sm:px-2",
                  isCurrent && "bg-background shadow-sm"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold sm:h-7 sm:w-7 sm:text-xs",
                    isComplete && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground",
                    !isComplete && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium sm:text-sm",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < displaySteps.length - 1 ? (
                <div
                  className={cn("mx-1 h-px w-4 sm:mx-2 sm:w-8", isComplete ? "bg-primary/60" : "bg-border")}
                  aria-hidden
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
