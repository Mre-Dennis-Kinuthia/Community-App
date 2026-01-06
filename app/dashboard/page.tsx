"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Users2, MessageSquare, CheckCircle2, ArrowUpRight, Plus, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { useState, useEffect } from "react"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Good morning")
  const userName = "John" // In real app, get from session

  useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  return (
    <div className="space-y-10">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{greeting}, {userName}</h1>
          <p className="text-muted-foreground text-base">
            Welcome back to Impact Hub Nairobi. Continue building your impact.
          </p>
        </div>
        <Button asChild className="shadow-sm">
          <Link href="/booking">
            <Plus className="mr-2 h-4 w-4" />
            Book Space
          </Link>
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer transition-all hover:shadow-card hover:scale-[1.01] border-border/50" onClick={() => window.location.href = "/booking"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 hrs</div>
            <p className="text-xs text-muted-foreground">Meeting room allowance</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-all hover:shadow-card hover:scale-[1.01] border-border/50" onClick={() => window.location.href = "/profile"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Status</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Fixed Desk Plan</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-all hover:shadow-card hover:scale-[1.01] border-border/50" onClick={() => window.location.href = "/attendance"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins This Week</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 days</div>
            <p className="text-xs text-muted-foreground">Consistent attendance!</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-all hover:shadow-card hover:scale-[1.01] border-border/50" onClick={() => window.location.href = "/community"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5</div>
            <p className="text-xs text-muted-foreground">From community board</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Your scheduled space reservations for this week.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { room: "Conference Room A", time: "Today, 2:00 PM - 3:30 PM", status: "Confirmed" },
                { room: "Phone Booth 2", time: "Tomorrow, 10:00 AM - 11:00 AM", status: "Pending" },
              ].map((booking, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{booking.room}</p>
                    <p className="text-xs text-muted-foreground">{booking.time}</p>
                  </div>
                  <Badge variant={booking.status === "Confirmed" ? "default" : "secondary"}>{booking.status}</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-4 w-full bg-transparent" asChild>
              <Link href="/booking">
                View All Bookings
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-3">
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
            <Button className="mt-4 w-full">Join Community Chat</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
