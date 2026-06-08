"use client"

import { useEffect } from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { resolveLumaRegistration } from "@/lib/luma"

const LUMA_SCRIPT_ID = "luma-checkout"

function ensureLumaCheckoutScript() {
  if (typeof document === "undefined") return
  if (document.getElementById(LUMA_SCRIPT_ID)) return
  const script = document.createElement("script")
  script.id = LUMA_SCRIPT_ID
  script.src = "https://embed.luma.com/checkout-button.js"
  script.type = "module"
  document.body.appendChild(script)
}

interface LumaRegistrationProps {
  event: {
    registrationProvider?: string | null
    lumaEventUrl?: string | null
    lumaEventId?: string | null
  }
  className?: string
  label?: string
}

export function LumaRegistration({
  event,
  className,
  label = "Register on Luma",
}: LumaRegistrationProps) {
  const { url, eventId } = resolveLumaRegistration(event)

  useEffect(() => {
    if (eventId) ensureLumaCheckoutScript()
  }, [eventId])

  if (!url) {
    return (
      <p className="text-sm text-muted-foreground">
        Luma registration link is not configured for this event.
      </p>
    )
  }

  if (eventId) {
    return (
      <a
        href={url}
        className={
          className ??
          "luma-checkout--button inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        }
        data-luma-action="checkout"
        data-luma-event-id={eventId}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>
    )
  }

  return (
    <Button className={className ?? "w-full"} size="lg" asChild>
      <a href={url} target="_blank" rel="noopener noreferrer">
        {label}
        <ExternalLink className="ml-2 h-4 w-4" />
      </a>
    </Button>
  )
}
