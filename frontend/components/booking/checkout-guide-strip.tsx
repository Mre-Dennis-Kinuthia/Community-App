"use client"

import { cn } from "@/lib/utils"

type CheckoutGuideStripProps = {
  ready: boolean
  hint: string | null
  onCheckout?: () => void
  className?: string
}

export function CheckoutGuideStrip({
  ready,
  hint,
  onCheckout,
  className,
}: CheckoutGuideStripProps) {
  const message =
    ready
      ? "Ready for checkout — tap below to continue to payment"
      : hint ?? "Complete the steps above, then checkout at the bottom"

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5 text-center text-xs leading-snug",
        ready
          ? "border-primary/30 bg-primary text-primary-foreground"
          : "border-border bg-muted/50 text-muted-foreground",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {ready && onCheckout ? (
        <button
          type="button"
          className="w-full font-semibold hover:underline underline-offset-2"
          onClick={onCheckout}
        >
          {message}
        </button>
      ) : (
        <p>{message}</p>
      )}
    </div>
  )
}
