"use client"

import { cn } from "@/lib/utils"

interface BookingStepProps {
  step: number | string
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  id?: string
}

export function BookingStep({
  step,
  title,
  description,
  children,
  className,
  id,
}: BookingStepProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 rounded-xl border border-border/80 bg-card p-4 sm:p-5",
        className
      )}
    >
      <header className="mb-4 flex gap-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
          aria-hidden
        >
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
          ) : null}
        </div>
      </header>
      <div className="min-w-0">{children}</div>
    </section>
  )
}
