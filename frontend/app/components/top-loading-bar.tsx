"use client"

import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

const TRICKLE_INTERVAL = 80
const STALL_MS = 8000
const COMPLETE_DURATION = 180

function isSameOriginNavigate(a: HTMLAnchorElement): boolean {
  const h = a.getAttribute("href")
  if (!h || h === "#" || h.startsWith("javascript:")) return false
  if (a.target === "_blank") return false
  if (h.startsWith("/")) return true
  try {
    return new URL(h, window.location.origin).origin === window.location.origin
  } catch {
    return false
  }
}

export function TopLoadingBar() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stallRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPathRef = useRef(pathname)
  const [reducedMotion, setReducedMotion] = useState(false)

  const complete = useCallback(() => {
    if (trickleRef.current) {
      clearInterval(trickleRef.current)
      trickleRef.current = null
    }
    if (stallRef.current) {
      clearTimeout(stallRef.current)
      stallRef.current = null
    }
    if (completeTimeoutRef.current) {
      clearTimeout(completeTimeoutRef.current)
      completeTimeoutRef.current = null
    }
    setProgress(100)
    completeTimeoutRef.current = setTimeout(() => {
      setIsActive(false)
      setProgress(0)
      completeTimeoutRef.current = null
    }, COMPLETE_DURATION)
  }, [])

  const start = useCallback(() => {
    if (reducedMotion) return
    if (trickleRef.current) clearInterval(trickleRef.current)
    if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current)
    if (stallRef.current) clearTimeout(stallRef.current)
    setIsActive(true)
    setProgress(0)
    trickleRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + (92 - p) * 0.12
        if (next >= 91) {
          if (trickleRef.current) {
            clearInterval(trickleRef.current)
            trickleRef.current = null
          }
          return 92
        }
        return next
      })
    }, TRICKLE_INTERVAL)
    stallRef.current = setTimeout(() => {
      stallRef.current = null
      complete()
    }, STALL_MS)
  }, [reducedMotion, complete])

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname
      if (isActive) complete()
    }
  }, [pathname, isActive, complete])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null
      if (!a || !isSameOriginNavigate(a)) return
      start()
    }
    const handlePopState = () => {
      start()
    }
    const handleNavStart = () => {
      start()
    }
    document.addEventListener("click", handleClick, true)
    window.addEventListener("popstate", handlePopState)
    window.addEventListener("navigationStart" as keyof WindowEventMap, handleNavStart)
    return () => {
      document.removeEventListener("click", handleClick, true)
      window.removeEventListener("popstate", handlePopState)
      window.removeEventListener("navigationStart" as keyof WindowEventMap, handleNavStart)
    }
  }, [start])

  useEffect(() => {
    if (typeof window === "undefined") return
    const m = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(m.matches)
    const on = () => setReducedMotion(m.matches)
    m.addEventListener("change", on)
    return () => m.removeEventListener("change", on)
  }, [])

  useEffect(() => {
    return () => {
      if (trickleRef.current) clearInterval(trickleRef.current)
      if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current)
      if (stallRef.current) clearTimeout(stallRef.current)
    }
  }, [])

  if (!isActive || reducedMotion) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 h-0.5 z-[100] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-primary transition-[transform] duration-150 ease-out"
        style={{
          transform: `scaleX(${progress / 100})`,
          transformOrigin: "left",
        }}
      />
    </div>
  )
}
