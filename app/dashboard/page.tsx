"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Users2, CheckCircle2, ArrowUpRight, ExternalLink, HelpCircle, Sparkles, X } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { useState, useEffect } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { WelcomeModal } from "@/components/welcome-modal"
import { Celebration } from "@/components/celebration"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Good morning")
  const userName = "John" // In real app, get from session
  const [showGettingStarted, setShowGettingStarted] = useState(true) // In real app, check if user is new

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  return (
    <TooltipProvider>
      <WelcomeModal />
      <Celebration />
      <div className="space-y-10">
        <Breadcrumbs items={[{ label: "Dashboard" }]} />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{greeting}, {userName}</h1>
            <p className="text-muted-foreground text-base">
              Welcome back to Impact Hub Nairobi. Continue building your impact.
            </p>
          </div>
        </div>

        {/* Getting Started Card for New Users */}
        {showGettingStarted && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>Welcome to Impact Hub Nairobi! Here's how to get the most out of the platform.</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowGettingStarted(false)}
                  aria-label="Dismiss getting started"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Link href="/community" className="group">
                  <div className="rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-accent/50">
                    <div className="mb-2 flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">Explore the Community</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Connect with entrepreneurs and innovators</p>
                  </div>
                </Link>
                <Link href="/events" className="group">
                  <div className="rounded-lg border p-4 transition-all hover:border-primary/50 hover:bg-accent/50">
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">Join an Event</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Discover workshops and networking events</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Card 
            className="cursor-pointer transition-all hover:shadow-card  border-border/50 focus-within:ring-2 focus-within:ring-ring" 
            onClick={() => window.location.href = "/profile"}
            role="button"
            tabIndex={0}
            aria-label="View community status and profile"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                window.location.href = "/profile"
              }
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Community Status</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Your current membership tier. Active members have full access to workspace, events, and community features.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground">Fixed Desk Plan</p>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer transition-all hover:shadow-card  border-border/50 focus-within:ring-2 focus-within:ring-ring" 
            onClick={() => window.location.href = "/events"}
            role="button"
            tabIndex={0}
            aria-label="View upcoming events"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                window.location.href = "/events"
              }
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer transition-all hover:shadow-card  border-border/50 focus-within:ring-2 focus-within:ring-ring" 
            onClick={() => window.location.href = "/community"}
            role="button"
            tabIndex={0}
            aria-label="View community directory"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                window.location.href = "/community"
              }
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Members</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>
        </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Community Highlights</CardTitle>
            <CardDescription>Stay updated with what's happening.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">New Program: Social Lab</p>
                  <p className="text-xs text-muted-foreground">Applications open until next Friday.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <Users2 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Monthly Townhall</p>
                  <p className="text-xs text-muted-foreground">Join us this Thursday at 4 PM in the lounge.</p>
                </div>
              </div>
            </div>
            <Button className="mt-4 w-full" asChild>
              <Link href="/events">
                View All Events
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
    </TooltipProvider>
  )
}
