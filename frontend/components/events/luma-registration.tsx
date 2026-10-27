"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { resolveLumaRegistration, safeLumaRedirectUrl } from "@/lib/luma"

interface LumaRegistrationProps {
  event: {
    registrationProvider?: string | null
    lumaEventUrl?: string | null
    lumaEventId?: string | null
  }
  className?: string
  label?: string
  isLoggedIn: boolean
}

export function LumaRegistration({
  event,
  className,
  label = "Register on Luma",
  isLoggedIn,
}: LumaRegistrationProps) {
  const { url } = resolveLumaRegistration(event)
  const safeUrl = safeLumaRedirectUrl(url)

  if (!safeUrl) {
    return (
      <p className="text-sm text-muted-foreground">
        Luma registration link is not configured for this event.
      </p>
    )
  }

  return (
    <Button className={className ?? "w-full"} size="lg" asChild>
      {isLoggedIn ? (
        <a href={safeUrl} target="_blank" rel="noopener noreferrer">
          {label}
          <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      ) : (
        <Link href={`/register?redirect=${encodeURIComponent(safeUrl)}`}>
          {label}
          <ExternalLink className="ml-2 h-4 w-4" />
        </Link>
      )}
    </Button>
  )
}
