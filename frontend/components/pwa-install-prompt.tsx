"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Download, Share, Smartphone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import {
  dismissPwaInstallPrompt,
  isAndroid,
  isIOS,
  isMobileDevice,
  isPwaInstallDismissed,
  isStandaloneMode,
  shouldShowPwaPromptOnPath,
} from "@/lib/pwa-install"

type InstallPlatform = "ios" | "android" | null

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstallPrompt() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState<InstallPlatform>(null)
  const [canNativeInstall, setCanNativeInstall] = useState(false)
  const [installing, setInstalling] = useState(false)
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (!shouldShowPwaPromptOnPath(pathname)) {
      setVisible(false)
      return
    }
    if (!isMobileDevice() || isStandaloneMode() || isPwaInstallDismissed()) {
      setVisible(false)
      return
    }

    if (isIOS()) {
      setPlatform("ios")
      const timer = window.setTimeout(() => setVisible(true), 2000)
      return () => window.clearTimeout(timer)
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      deferredPromptRef.current = event as BeforeInstallPromptEvent
      setCanNativeInstall(true)
      setPlatform("android")
      setVisible(true)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall)

    // Android browsers that don't fire beforeinstallprompt (e.g. missing PNG icons)
    const fallbackTimer = window.setTimeout(() => {
      if (!deferredPromptRef.current && isAndroid()) {
        setPlatform("android")
        setVisible(true)
      }
    }, 3000)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.clearTimeout(fallbackTimer)
    }
  }, [pathname])

  const handleDismiss = () => {
    dismissPwaInstallPrompt()
    setVisible(false)
  }

  const handleInstall = async () => {
    const prompt = deferredPromptRef.current
    if (!prompt) return
    setInstalling(true)
    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === "accepted") {
        dismissPwaInstallPrompt()
        setVisible(false)
      }
    } finally {
      deferredPromptRef.current = null
      setInstalling(false)
    }
  }

  if (!visible || !platform) return null

  return (
    <div
      className="fixed inset-x-0 z-[60] px-4 md:hidden"
      style={{ bottom: "calc(4.25rem + env(safe-area-inset-bottom))" }}
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
    >
      <div className="rounded-xl border border-border bg-card p-4 shadow-elevated">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Smartphone className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <Logo variant="mark" className="mt-0" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleDismiss}
                aria-label="Dismiss install suggestion"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p id="pwa-install-title" className="text-sm font-semibold">
              Install Impact Hub on your phone
            </p>
            <p id="pwa-install-desc" className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {platform === "ios" ? (
                <>
                  Add this app to your home screen for quick access — tap{" "}
                  <Share className="inline h-3.5 w-3.5 align-text-bottom" aria-hidden />{" "}
                  <strong className="font-medium text-foreground">Share</strong>, then{" "}
                  <strong className="font-medium text-foreground">Add to Home Screen</strong>.
                </>
              ) : canNativeInstall ? (
                "Install the member app on your home screen for faster check-in, booking, and community access."
              ) : (
                <>
                  Open your browser menu and choose{" "}
                  <strong className="font-medium text-foreground">Install app</strong> or{" "}
                  <strong className="font-medium text-foreground">Add to Home screen</strong>.
                </>
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {platform === "android" && canNativeInstall ? (
                <Button type="button" size="sm" onClick={handleInstall} disabled={installing}>
                  <Download className="mr-1.5 h-4 w-4" aria-hidden />
                  {installing ? "Installing…" : "Install app"}
                </Button>
              ) : null}
              <Button type="button" variant="outline" size="sm" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
