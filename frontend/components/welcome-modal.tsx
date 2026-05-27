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

interface WelcomeModalProps {
  onboardingComplete?: boolean
  userName?: string | null
}

const QUICK_LINKS = [
  {
    icon: Calendar,
    title: "Book workspace",
    description: "Reserve desks, meeting rooms, or inquire about private office.",
    href: "/booking",
  },
  {
    icon: Users,
    title: "Browse the community",
    description: "Find members, collaborators, and mentors in the directory.",
    href: "/community",
  },
  {
    icon: BookOpen,
    title: "View events",
    description: "See upcoming workshops, programs, and networking sessions.",
    href: "/events",
  },
] as const

export function WelcomeModal({ onboardingComplete = true, userName }: WelcomeModalProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && onboardingComplete) {
      const hasSeenWelcome = localStorage.getItem("hasSeenWelcome")
      if (!hasSeenWelcome) {
        setOpen(true)
        sessionStorage.removeItem("onboardingJustCompleted")
      }
    }
  }, [onboardingComplete])

  const handleClose = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hasSeenWelcome", "true")
      sessionStorage.removeItem("onboardingJustCompleted")
    }
    setOpen(false)
  }

  const firstName = userName?.trim().split(/\s+/)[0] || ""

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? handleClose() : setOpen(next))}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <Logo variant="compact" />
          <DialogTitle className="pt-2">
            {firstName ? `Welcome, ${firstName}` : "Welcome to Impact Hub Nairobi"}
          </DialogTitle>
          <DialogDescription>
            Here are the main areas of the member platform. You can revisit these anytime from the sidebar.
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

        <Button type="button" className="w-full" onClick={handleClose}>
          Continue to dashboard
        </Button>
      </DialogContent>
    </Dialog>
  )
}
