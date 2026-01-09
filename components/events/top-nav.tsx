"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Search, Bell, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

export function TopNav() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  const timeString = format(currentTime, "h:mm a")
  const timezone = "GMT+3"

  return (
    <header className="sticky top-0 z-50 border-b border-[#222836] bg-[#0B0F14]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0B0F14]/80">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
                <span className="text-xs font-bold text-primary">★</span>
              </div>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/events"
                className="text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
              >
                Events
              </Link>
              <Link
                href="/events"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Calendars
              </Link>
              <Link
                href="/events"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Discover
              </Link>
            </nav>
          </div>

          {/* Right: Time + Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden text-sm text-muted-foreground md:block">
              {timeString} {timezone}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hidden text-sm font-normal text-muted-foreground hover:text-foreground md:flex"
            >
              Create Event
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback className="bg-[#151A21] text-muted-foreground">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}

