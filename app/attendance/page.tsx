"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, CalendarIcon, LogOut, Download } from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { format } from "date-fns"
import { toast } from "@/lib/toast"

const attendanceHistory = [
  { date: "Jan 1, 2026", timeIn: "08:45 AM", timeOut: "05:30 PM", duration: "8h 45m" },
  { date: "Dec 31, 2025", timeIn: "09:12 AM", timeOut: "04:15 PM", duration: "7h 03m" },
  { date: "Dec 30, 2025", timeIn: "08:30 AM", timeOut: "06:00 PM", duration: "9h 30m" },
]

export default function AttendancePage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [currentDuration, setCurrentDuration] = useState("0h 0m")

  const handleCheckIn = () => {
    if (!isCheckedIn) {
      const now = new Date()
      setCheckInTime(now)
      setIsCheckedIn(true)
      toast.success("Checked in!", `Welcome to Impact Hub Nairobi at ${format(now, "h:mm a")}`)
    } else {
      // Check out
      const duration = currentDuration
      setIsCheckedIn(false)
      setCheckInTime(null)
      setCurrentDuration("0h 0m")
      toast.info("Checked out", `You were here for ${duration}. See you next time!`)
    }
  }

  // Update duration every minute when checked in
  useEffect(() => {
    if (isCheckedIn && checkInTime) {
      const updateDuration = () => {
        const now = new Date()
        const diff = now.getTime() - checkInTime.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        setCurrentDuration(`${hours}h ${minutes}m`)
      }
      
      updateDuration() // Update immediately
      const interval = setInterval(updateDuration, 60000) // Then every minute

      return () => clearInterval(interval)
    }
  }, [isCheckedIn, checkInTime])

  const lastVisit = attendanceHistory[0]?.date || "Never"

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <Breadcrumbs items={[{ label: "Attendance" }]} />
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Check-in & Attendance</h1>
          <p className="text-muted-foreground text-base">Log your hub visits and track your presence.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Daily Status</CardTitle>
              <CardDescription>Check in to start your session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed py-10 transition-all ${
                  isCheckedIn
                    ? "border-primary bg-primary/5 animate-in fade-in-0 zoom-in-95"
                    : ""
                }`}
              >
                <div
                  className={`rounded-full p-4 transition-all ${
                    isCheckedIn
                      ? "bg-primary text-primary-foreground scale-110"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {isCheckedIn ? (
                    <CheckCircle2 className="h-10 w-10 animate-in zoom-in-95" />
                  ) : (
                    <Clock className="h-10 w-10" />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-medium">
                    {isCheckedIn ? "You are checked in" : "You are not checked in"}
                  </p>
                  {isCheckedIn && checkInTime ? (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Checked in: {format(checkInTime, "h:mm a")}
                      </p>
                      <p className="text-lg font-bold text-primary">{currentDuration}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Last visit: {lastVisit}</p>
                  )}
                </div>
                <Button
                  className="w-full max-w-[200px]"
                  size="lg"
                  onClick={handleCheckIn}
                  variant={isCheckedIn ? "destructive" : "default"}
                >
                  {isCheckedIn ? (
                    <>
                      <LogOut className="mr-2 h-5 w-5" />
                      Check Out
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Check In Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>Your hub activity over the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No attendance records</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your check-in history will appear here
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {attendanceHistory.map((log, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-all hover:shadow-soft"
                      >
                        <div className="flex items-center gap-4">
                          <div className="rounded-md bg-muted p-2">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{log.date}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.timeIn} - {log.timeOut}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">{log.duration}</Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-4 w-full bg-transparent" asChild>
                    <a href="#" onClick={(e) => {
                      e.preventDefault()
                      alert("Report download would be implemented here")
                    }}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </a>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
