import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, CalendarIcon } from "lucide-react"

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check-in & Attendance</h1>
          <p className="text-muted-foreground">Log your hub visits and track your presence.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Daily Status</CardTitle>
              <CardDescription>Check in to start your session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed py-10">
                <div className="rounded-full bg-primary/10 p-4 text-primary">
                  <Clock className="h-10 w-10" />
                </div>
                <div className="text-center">
                  <p className="font-medium">You are not checked in</p>
                  <p className="text-sm text-muted-foreground">Last visit: Yesterday, 9:00 AM</p>
                </div>
                <Button className="w-full max-w-[200px]" size="lg">
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Check In Now
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
              <div className="space-y-4">
                {[
                  { date: "Jan 1, 2026", timeIn: "08:45 AM", timeOut: "05:30 PM", duration: "8h 45m" },
                  { date: "Dec 31, 2025", timeIn: "09:12 AM", timeOut: "04:15 PM", duration: "7h 03m" },
                  { date: "Dec 30, 2025", timeIn: "08:30 AM", timeOut: "06:00 PM", duration: "9h 30m" },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-4">
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
              <Button variant="outline" className="mt-4 w-full bg-transparent">
                Download Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
