"use client"

import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface MobileFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  activeCount?: number
  onClear?: () => void
  onApply?: () => void
  children: React.ReactNode
  triggerClassName?: string
}

export function MobileFilterSheet({
  open,
  onOpenChange,
  title = "Filters",
  activeCount = 0,
  onClear,
  onApply,
  children,
  triggerClassName,
}: MobileFilterSheetProps) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "relative h-11 w-11 shrink-0 rounded-xl border-border/60 bg-muted/30 md:hidden",
          triggerClassName
        )}
        onClick={() => onOpenChange(true)}
        aria-label="Open filters"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {activeCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {activeCount > 9 ? "9+" : activeCount}
          </span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl px-0 pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
          <SheetHeader className="px-5 pb-2 text-left">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="max-h-[55vh] overflow-y-auto px-5 py-2">{children}</div>
          <SheetFooter className="flex-row gap-2 border-t border-border px-5 py-4 sm:justify-between">
            {onClear && (
              <Button type="button" variant="ghost" onClick={onClear} className="flex-1">
                Clear all
              </Button>
            )}
            <Button
              type="button"
              className="flex-1"
              onClick={() => {
                onApply?.()
                onOpenChange(false)
              }}
            >
              Show results
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
