"use client"

import { useEffect, useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import {
  MembershipIdCard,
  type MembershipIdCardProps,
} from "@/components/membership/membership-id-card"
import { cn } from "@/lib/utils"

type MembershipCardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & Omit<MembershipIdCardProps, "flipped" | "onFlippedChange" | "className">

/**
 * Flex/inset centering without CSS transform, so preserve-3d flip still works.
 * Content is sized to the card (not full viewport) so overlay clicks dismiss.
 */
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
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/75",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 m-auto h-fit w-fit max-h-[calc(100vh-2rem)] max-w-[calc(100vw-1.5rem)]",
            "border-0 bg-transparent p-4 shadow-none outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            {cardProps.membership?.label
              ? `${cardProps.membership.label} membership card`
              : "Membership card"}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Flippable membership ID card. Tap the card to view benefits on the back.
          </DialogPrimitive.Description>

          <div className="relative">
            <MembershipIdCard
              {...cardProps}
              flipped={flipped}
              onFlippedChange={setFlipped}
            />
            <DialogPrimitive.Close
              className={cn(
                "absolute -right-1 -top-1 z-30 rounded-full bg-white p-1.5 text-[#0a1f38] shadow-md",
                "opacity-100 transition-opacity hover:opacity-90",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#822929]"
              )}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
