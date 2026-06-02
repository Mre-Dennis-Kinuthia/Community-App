"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingStepProps {
  step: number | string
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  id?: string
  status?: "complete" | "current" | "upcoming"
}

export function BookingStep({
  step,
  title,
  description,
  children,
  className,
  id,
  status = "current",
}: BookingStepProps) {
  const isUpcoming = status === "upcoming"
  const isComplete = status === "complete"

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-28 rounded-xl border bg-card transition-all",
        isComplete && "border-border/60 bg-muted/20",
        status === "current" && "border-primary/30 shadow-sm ring-1 ring-primary/10",
        isUpcoming && "border-dashed border-border/60 opacity-60",
        className
      )}
      aria-current={status === "current" ? "step" : undefined}
    >
      <header className="flex gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            isComplete && "bg-primary text-primary-foreground",
            status === "current" && "bg-primary text-primary-foreground",
            isUpcoming && "bg-muted text-muted-foreground"
          )}
          aria-hidden
        >
          {isComplete ? <Check className="h-4 w-4" /> : step}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold tracking-tight sm:text-base">{title}</h2>
          {description && status === "current" ? (
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{description}</p>
          ) : null}
        </div>
      </header>
      {!isUpcoming ? (
        <div className="min-w-0 px-4 py-4 sm:px-5 sm:py-5">{children}</div>
      ) : null}
    </section>
  )
}
