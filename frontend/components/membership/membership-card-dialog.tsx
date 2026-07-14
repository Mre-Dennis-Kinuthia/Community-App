"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  MembershipIdCard,
  type MembershipIdCardProps,
} from "@/components/membership/membership-id-card"
import { cn } from "@/lib/utils"

type MembershipCardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & Omit<MembershipIdCardProps, "flipped" | "onFlippedChange" | "className">

export function MembershipCardDialog({
  open,
  onOpenChange,
  ...cardProps
}: MembershipCardDialogProps) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    if (!open) setFlipped(false)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-auto max-w-[min(100vw-2rem,24rem)] border-0 bg-transparent p-0 shadow-none",
          "[&>button]:right-0 [&>button]:top-0 [&>button]:z-20 [&>button]:rounded-full",
          "[&>button]:bg-white/90 [&>button]:p-1.5 [&>button]:opacity-100 [&>button]:shadow-md",
          "[&>button]:text-[#0a1f38]"
        )}
      >
        <DialogTitle className="sr-only">
          {cardProps.membership?.label
            ? `${cardProps.membership.label} membership card`
            : "Membership card"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Flippable membership ID card. Tap the card to view benefits on the back.
        </DialogDescription>
        <MembershipIdCard
          {...cardProps}
          flipped={flipped}
          onFlippedChange={setFlipped}
        />
      </DialogContent>
    </Dialog>
  )
}
