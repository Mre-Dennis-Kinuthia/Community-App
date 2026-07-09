import type React from "react"
import type { Metadata, Viewport } from "next"
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
  title: {
    default: "Impact Hub Nairobi Community Platform",
    template: "%s · Impact Hub Nairobi",
  },
  description:
    "For impact startups and innovators. Impact Hub Nairobi's official member platform — book workspace, join programs and events, and connect with Kenya's impact community.",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/impact-hub-app-icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Impact Hub",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: "Impact Hub Nairobi — For Impact Startups & Innovators",
    description:
      "Official member platform for workspace, events, programs, and community. Part of the global Impact Hub network.",
    type: "website",
    siteName: "Impact Hub Nairobi",
    locale: "en_KE",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Impact Hub Nairobi — For Impact Startups & Innovators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Impact Hub Nairobi — For Impact Startups & Innovators",
    description:
      "Official member platform for workspace, events, programs, and community.",
    images: ["/twitter-image"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#A6192E" },
    { media: "(prefers-color-scheme: dark)", color: "#A6192E" },
  ],
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
