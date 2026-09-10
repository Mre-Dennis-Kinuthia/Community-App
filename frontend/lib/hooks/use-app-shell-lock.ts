"use client"

import { useEffect } from "react"

const APP_SHELL_CLASS = "app-shell"

let lockCount = 0

/** Lock document Y-scroll so only the app content pane moves, not the chrome. */
export function useAppShellLock() {
  useEffect(() => {
    lockCount += 1
    document.documentElement.classList.add(APP_SHELL_CLASS)
    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) {
        document.documentElement.classList.remove(APP_SHELL_CLASS)
      }
    }
  }, [])
}
