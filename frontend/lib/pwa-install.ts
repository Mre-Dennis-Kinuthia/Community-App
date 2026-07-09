const DISMISSED_KEY = "pwa-install-dismissed-at"
const DISMISS_DAYS = 30

/** Public/marketing routes where the install nudge should not appear */
const SKIP_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/accept-invite",
  "/setup-check",
])

export function shouldShowPwaPromptOnPath(pathname: string): boolean {
  if (SKIP_PATHS.has(pathname)) return false
  if (pathname.startsWith("/pay/")) return false
  return true
}

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false
  return /Android/i.test(navigator.userAgent)
}

/** Already opened from home screen / installed PWA */
export function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function isPwaInstallDismissed(): boolean {
  if (typeof window === "undefined") return true
  const raw = localStorage.getItem(DISMISSED_KEY)
  if (!raw) return false
  const dismissedAt = Number(raw)
  if (Number.isNaN(dismissedAt)) return true
  const msElapsed = Date.now() - dismissedAt
  return msElapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000
}

export function dismissPwaInstallPrompt(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(DISMISSED_KEY, String(Date.now()))
}

export function applyStandaloneDocumentClass(): void {
  if (typeof document === "undefined" || !isStandaloneMode()) return
  document.documentElement.classList.add("pwa-standalone")
}

export async function registerPwaServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null
  if (process.env.NODE_ENV === "development") return null

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
    return registration
  } catch {
    // Non-fatal — iOS install still works via Add to Home Screen
    return null
  }
}

export async function checkForPwaUpdate(): Promise<void> {
  const registration = await registerPwaServiceWorker()
  if (!registration) return

  registration.addEventListener("updatefound", () => {
    const worker = registration.installing
    if (!worker) return
    worker.addEventListener("statechange", () => {
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        worker.postMessage({ type: "SKIP_WAITING" })
      }
    })
  })

  if (registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" })
  }

  await registration.update().catch(() => undefined)
}
