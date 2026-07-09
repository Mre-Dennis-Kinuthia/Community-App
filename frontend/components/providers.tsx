"use client"

import { SWRConfig } from "swr"
import { SessionProvider } from "@/components/session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { PwaBootstrap } from "@/components/pwa-bootstrap"
import { PwaInstallPrompt } from "@/components/pwa-install-prompt"
import { fetcher, SWR_CONFIG } from "@/lib/fetcher"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <SWRConfig value={{ fetcher, ...SWR_CONFIG }}>
          <PwaBootstrap />
          {children}
          <PwaInstallPrompt />
        </SWRConfig>
      </ThemeProvider>
    </SessionProvider>
  )
}
