"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Calendar, Users, BookOpen, ArrowRight } from "lucide-react"
import { markWelcomeSeen, hasSeenWelcome } from "@/lib/getting-started"

interface WelcomeModalProps {
  onboardingComplete?: boolean
  userName?: string | null
  onWelcomeComplete?: () => void
}

const QUICK_LINKS = [
  {
    icon: Calendar,
    title: "Book workspace",
    description: "Reserve a desk, meeting room, or collaboration space in Westlands.",
    href: "/booking",
  },
  {
    icon: Users,
    title: "Meet the community",
    description: "Browse members, find collaborators, and grow your impact network.",
    href: "/community",
  },
  {
    icon: BookOpen,
    title: "Join programs & events",
    description: "Workshops, mixers, and acceleration programs for impact startups.",
    href: "/events",
  },
] as const

export function WelcomeModal({
  onboardingComplete = true,
  userName,
  onWelcomeComplete,
}: WelcomeModalProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && onboardingComplete && !hasSeenWelcome()) {
      setOpen(true)
    }
  }, [onboardingComplete])

  const handleClose = () => {
    markWelcomeSeen()
    setOpen(false)
    onWelcomeComplete?.()
  }

  const firstName = userName?.trim().split(/\s+/)[0] || ""

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? handleClose() : setOpen(next))}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <Logo variant="compact" />
          <DialogTitle className="pt-2">
            {firstName ? `You're in, ${firstName}` : "You're in — welcome to the community"}
          </DialogTitle>
          <DialogDescription>
            Inclusive and sustainable innovation at scale. You&apos;re now part of Impact Hub
            Nairobi&apos;s member platform — here are three ways to get started.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-3">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleClose}
                  className="flex gap-3 rounded-md border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="rounded-md bg-primary/10 p-2 h-fit">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 self-center text-muted-foreground" aria-hidden />
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="flex flex-col gap-2">
          <Button type="button" className="w-full" onClick={handleClose}>
            Explore the platform
          </Button>
          <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={handleClose}>
            Skip tour
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
