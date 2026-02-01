import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"
import { SkipLink } from "@/components/skip-link"
import { PageTransition } from "@/app/components/page-transition"
import { TopLoadingBar } from "@/app/components/top-loading-bar"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Impact Hub Nairobi Community Platform - Powered by Impact Hub Nairobi",
  description:
    "Impact Hub Nairobi's official digital platform. Access programs, resources, and community connections distributed through our network. Join Kenya's leading innovation community.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
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
