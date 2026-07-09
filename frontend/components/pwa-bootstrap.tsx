"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import {
  applyStandaloneDocumentClass,
  checkForPwaUpdate,
  isStandaloneMode,
} from "@/lib/pwa-install"

/**
 * Registers the service worker on every visit (not only when the install banner shows),
 * applies standalone styling, and surfaces connectivity changes in the installed app.
 */
export function PwaBootstrap() {
  useEffect(() => {
    applyStandaloneDocumentClass()

    void checkForPwaUpdate()

    const onControllerChange = () => {
      if (isStandaloneMode()) {
        window.location.reload()
      }
    }
    navigator.serviceWorker?.addEventListener("controllerchange", onControllerChange)

    if (!isStandaloneMode()) {
      return () => {
        navigator.serviceWorker?.removeEventListener("controllerchange", onControllerChange)
      }
    }

    let wasOffline = !navigator.onLine

    const onOnline = () => {
      if (wasOffline) {
        toast.success("Back online", { description: "Your connection was restored." })
        wasOffline = false
      }
    }

    const onOffline = () => {
      wasOffline = true
      toast.message("You are offline", {
        description: "Some features need an internet connection.",
        duration: 5000,
      })
    }

    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)

    return () => {
      navigator.serviceWorker?.removeEventListener("controllerchange", onControllerChange)
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }, [])

  return null
}
