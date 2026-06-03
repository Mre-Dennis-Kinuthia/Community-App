"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowDown, ShoppingBag } from "lucide-react"

type CheckoutGuideBubbleProps = {
  ready: boolean
  hint: string | null
  onCheckout: () => void
  onPointToCheckout?: () => void
  className?: string
  /** Tail points down toward mobile checkout bar */
  tail?: "down" | "none"
}

export function CheckoutGuideBubble({
  ready,
  hint,
  onCheckout,
  onPointToCheckout,
  className,
  tail = "down",
}: CheckoutGuideBubbleProps) {
  if (!ready && !hint) return null

  const handleClick = () => {
    if (ready) {
      onCheckout()
      return
    }
    onPointToCheckout?.()
  }

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-300",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "rounded-2xl border px-4 py-3 shadow-lg",
          ready
            ? "border-primary/30 bg-primary text-primary-foreground"
            : "border-border bg-card text-card-foreground"
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              ready ? "bg-primary-foreground/15" : "bg-primary/10 text-primary"
            )}
            aria-hidden
          >
            <ShoppingBag className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-semibold leading-snug">
              {ready ? "You're ready to checkout" : "Almost there"}
            </p>
            <p className={cn("text-xs leading-relaxed", ready ? "text-primary-foreground/90" : "text-muted-foreground")}>
              {ready
                ? "Review your total and continue to payment."
                : hint}
            </p>
            <Button
              type="button"
              size="sm"
              variant={ready ? "secondary" : "default"}
              className={cn(
                "h-9 w-full font-semibold",
                ready && "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              )}
              onClick={handleClick}
            >
              {ready ? "Go to checkout" : "Show me checkout"}
            </Button>
          </div>
        </div>
      </div>
      {tail === "down" && (
        <div
          className="mx-auto -mt-px flex justify-center"
          aria-hidden
        >
          <div
            className={cn(
              "h-3 w-3 rotate-45 border-b border-r",
              ready
                ? "border-primary/30 bg-primary"
                : "border-border bg-card"
            )}
          />
        </div>
      )}
      {!ready && tail === "down" && (
        <div className="mt-1 flex justify-center text-muted-foreground">
          <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden />
        </div>
      )}
    </div>
  )
}
