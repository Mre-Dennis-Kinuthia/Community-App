"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Calendar, Users, BookOpen, X } from "lucide-react"
import Link from "next/link"

export function WelcomeModal() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if user has seen welcome before
    if (typeof window !== "undefined") {
      const hasSeenWelcome = localStorage.getItem("hasSeenWelcome")
      if (!hasSeenWelcome) {
        setOpen(true)
      }
    }
  }, [])

  const handleClose = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hasSeenWelcome", "true")
    }
    setOpen(false)
  }

  const handleNext = () => {
    if (currentStep < 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handleSkip = () => {
    handleClose()
  }

  const steps = [
    {
      icon: Users,
      title: "Connect with the Community",
      description: "Explore our directory of social entrepreneurs, innovators, and changemakers. Connect and collaborate.",
      action: "Explore Community",
      href: "/community",
    },
    {
      icon: BookOpen,
      title: "Join Events & Programs",
      description: "Discover workshops, networking events, and programs designed to accelerate your social impact journey.",
      action: "View Events",
      href: "/events",
    },
  ]

  const StepIcon = steps[currentStep].icon

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Welcome to Impact Hub Nairobi!</DialogTitle>
                <DialogDescription className="text-base mt-1">
                  Let's get you started
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8"
              aria-label="Skip tour"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="py-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="rounded-full bg-primary/10 p-6">
              <StepIcon className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{steps[currentStep].title}</h3>
              <p className="text-muted-foreground">{steps[currentStep].description}</p>
            </div>
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Skip Tour
          </Button>
          {currentStep < 1 ? (
            <Button onClick={handleNext} className="flex-1">
              Next
            </Button>
          ) : (
            <Button asChild onClick={handleClose} className="flex-1">
              <Link href={steps[currentStep].href}>
                {steps[currentStep].action}
              </Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

