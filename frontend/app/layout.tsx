import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"
import { SkipLink } from "@/components/skip-link"
import { PageTransition } from "@/app/components/page-transition"
import { TopLoadingBar } from "@/app/components/top-loading-bar"
import { getAppBaseUrl } from "@/lib/app-url"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getAppBaseUrl()),
  title: "Impact Hub Nairobi Community Platform - Powered by Impact Hub Nairobi",
  description:
    "Impact Hub Nairobi's official digital platform. Access programs, resources, and community connections distributed through our network. Join Kenya's leading innovation community.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Impact Hub Nairobi Community Platform",
    description:
      "Impact Hub Nairobi's official digital platform. Access programs, resources, and community connections.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Impact Hub Nairobi Community Platform",
    description:
      "Impact Hub Nairobi's official digital platform. Access programs, resources, and community connections.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <SkipLink />
        <Providers>
          <TopLoadingBar />
          <PageTransition>
            {children}
          </PageTransition>
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
