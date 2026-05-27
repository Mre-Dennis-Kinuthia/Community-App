"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isFirstNavigation = useRef(true)
  const [isVisible, setIsVisible] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setIsVisible(true)
      return
    }

    // Skip hide/show on first paint — avoids a blank flash and stuck opacity in Strict Mode
    if (isFirstNavigation.current) {
      isFirstNavigation.current = false
      setIsVisible(true)
      return
    }

    setIsVisible(false)
    const id = window.setTimeout(() => setIsVisible(true), 50)

    return () => {
      window.clearTimeout(id)
      setIsVisible(true)
    }
  }, [pathname, reducedMotion])

  if (reducedMotion) {
    return <>{children}</>
  }

  return (
    <div
      className={cn(
        "min-h-0 transition-opacity duration-150 ease-out",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {children}
    </div>
  )
}
