"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Calendar, Users, BookOpen, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface WelcomeModalProps {
  /** Only show the tutorial after onboarding is complete (default true for backward compat) */
  onboardingComplete?: boolean
  /** User's display name for personalized greeting */
  userName?: string | null
}

const STEPS = [
  {
    icon: Calendar,
    title: "Book your workspace",
    description: "Reserve meeting rooms, collaboration zones, and wellness studios. Your credits are your monthly workspace allowance—use them to book what you need.",
    action: "Go to Booking",
    href: "/booking",
  },
  {
    icon: Users,
    title: "Connect with the community",
    description: "Explore our directory of social entrepreneurs, innovators, and changemakers. Find collaborators, get introduced, and grow your impact together.",
    action: "Explore community",
    href: "/community",
  },
  {
    icon: BookOpen,
    title: "Join events & programs",
    description: "Discover workshops, networking events, and programs designed to accelerate your social impact journey. Check the calendar and sign up.",
    action: "View events",
    href: "/events",
  },
] as const

export function WelcomeModal({ onboardingComplete = true, userName }: WelcomeModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

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

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) handleClose()
    setOpen(nextOpen)
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const handleSkip = () => {
    handleClose()
  }

  const goToStepLink = () => {
    const step = STEPS[currentStep]
    handleClose()
    router.push(step.href)
  }

  const firstName = userName?.trim().split(/\s+/)[0] || ""
  const StepIcon = STEPS[currentStep].icon
  const totalSteps = STEPS.length
  const isLastStep = currentStep === totalSteps - 1

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 space-y-0 pr-12">
          <div className="flex flex-col gap-2 min-w-0">
            <Logo variant="compact" />
            <div>
              <DialogTitle className="text-xl sm:text-2xl">
                {firstName ? `Welcome, ${firstName}` : "Welcome to Impact Hub Nairobi"}
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Quick tour — step {currentStep + 1} of {totalSteps}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6" aria-live="polite" aria-atomic="true">
          <div
            key={currentStep}
            className="flex flex-col items-center text-center space-y-5 animate-in fade-in-0 duration-200"
          >
            <div className="rounded-2xl bg-primary/10 p-5">
              <StepIcon className="h-10 w-10 text-primary" aria-hidden />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold">{STEPS[currentStep].title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {STEPS[currentStep].description}
              </p>
            </div>
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Tour steps">
              {STEPS.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  role="tab"
                  aria-selected={index === currentStep}
                  aria-label={`Step ${index + 1}: ${STEPS[index].title}`}
                  title={STEPS[index].title}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-200",
                    index === currentStep ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 pb-6 pt-0 border-t bg-muted/30">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleSkip}>
              Skip tour
            </Button>
            {!isLastStep ? (
              <Button type="button" size="sm" onClick={handleNext} className="gap-1.5">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button type="button" size="sm" variant="outline" onClick={goToStepLink} className="gap-1.5">
                  {STEPS[currentStep].action}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" size="sm" onClick={handleClose} className="gap-1.5">
                  Finish tour
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

