"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function Celebration() {
  const [celebrating, setCelebrating] = useState(false)
  const [type, setType] = useState<string | null>(null)

  useEffect(() => {
    const handleCelebrate = (e: CustomEvent) => {
      setType(e.detail.type)
      setCelebrating(true)
      setTimeout(() => setCelebrating(false), 3000)
    }

    window.addEventListener("celebrate" as any, handleCelebrate as EventListener)
    return () => {
      window.removeEventListener("celebrate" as any, handleCelebrate as EventListener)
    }
  }, [])

  if (!celebrating) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className={cn(
        "flex flex-col items-center gap-4 p-8 rounded-2xl bg-background border-2 border-primary shadow-2xl animate-in fade-in zoom-in-95 duration-300",
        celebrating && "animate-in fade-in zoom-in-95"
      )}>
        {type === "firstBooking" && (
          <>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative rounded-full bg-primary/10 p-6">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">🎉 First Booking Complete!</h3>
              <p className="text-muted-foreground">
                You're all set! Your workspace is reserved.
              </p>
            </div>
          </>
        )}
        {type === "milestone" && (
          <>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative rounded-full bg-primary/10 p-6">
                <Sparkles className="h-16 w-16 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">Milestone Achieved!</h3>
              <p className="text-muted-foreground">
                Keep up the great work!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

