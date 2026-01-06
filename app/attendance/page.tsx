"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/app/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  Clock, 
  CalendarIcon, 
  LogOut, 
  Download, 
  QrCode,
  MapPin,
  Users,
  TrendingUp,
  Flame,
  Calendar,
  Filter,
  Search,
  Activity,
  Zap,
  Award,
  BarChart3
} from "lucide-react"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { format, differenceInHours, differenceInMinutes, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { toast } from "@/lib/toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data - in real app, this would come from API
const attendanceHistory = [
  { id: 1, date: new Date(2026, 0, 1), timeIn: "08:45 AM", timeOut: "05:30 PM", duration: "8h 45m", location: "Main Hub", method: "QR Code" },
  { id: 2, date: new Date(2025, 11, 31), timeIn: "09:12 AM", timeOut: "04:15 PM", duration: "7h 03m", location: "Main Hub", method: "Manual" },
  { id: 3, date: new Date(2025, 11, 30), timeIn: "08:30 AM", timeOut: "06:00 PM", duration: "9h 30m", location: "Main Hub", method: "QR Code" },
  { id: 4, date: new Date(2025, 11, 29), timeIn: "10:00 AM", timeOut: "03:45 PM", duration: "5h 45m", location: "Main Hub", method: "QR Code" },
  { id: 5, date: new Date(2025, 11, 28), timeIn: "09:00 AM", timeOut: "05:00 PM", duration: "8h 00m", location: "Main Hub", method: "Manual" },
]

const currentlyCheckedIn = [
  { name: "Sarah Kimani", checkedInAt: "08:30 AM", avatar: "/placeholder-user.jpg" },
  { name: "David Ochieng", checkedInAt: "09:15 AM", avatar: "/placeholder-user.jpg" },
  { name: "Mary Wanjiku", checkedInAt: "10:00 AM", avatar: "/placeholder-user.jpg" },
]

export default function AttendancePage() {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [currentDuration, setCurrentDuration] = useState("0h 0m")
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate statistics
  const thisWeek = attendanceHistory.filter(record => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
    return record.date >= weekStart && record.date <= weekEnd
  })

  const thisMonth = attendanceHistory.filter(record => {
    const now = new Date()
    return record.date.getMonth() === now.getMonth() && record.date.getFullYear() === now.getFullYear()
  })

  const totalHours = thisMonth.reduce((acc, record) => {
    const hours = parseInt(record.duration.split('h')[0])
    const minutes = parseInt(record.duration.split('h')[1]?.split('m')[0] || '0')
    return acc + hours + (minutes / 60)
  }, 0)

  const currentStreak = 5 // Calculate from attendanceHistory
  const longestStreak = 12

  const handleCheckIn = (method: "manual" | "qr" = "manual") => {
    if (!isCheckedIn) {
      const now = new Date()
      setCheckInTime(now)
      setIsCheckedIn(true)
      toast.success("Checked in!", `Welcome to Impact Hub Nairobi at ${format(now, "h:mm a")}`)
      if (method === "qr") {
        setShowQRScanner(false)
      }
    } else {
      // Check out
      const duration = currentDuration
      setIsCheckedIn(false)
      setCheckInTime(null)
      setCurrentDuration("0h 0m")
      toast.info("Checked out", `You were here for ${duration}. See you next time!`)
    }
  }

  const handleQRCheckIn = () => {
    setShowQRScanner(true)
    // In real app, this would open camera/QR scanner
    setTimeout(() => {
      handleCheckIn("qr")
    }, 1000)
  }

  // Update duration every second when checked in
  useEffect(() => {
    if (isCheckedIn && checkInTime) {
      const updateDuration = () => {
        const now = new Date()
        const diff = now.getTime() - checkInTime.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setCurrentDuration(`${hours}h ${minutes}m ${seconds}s`)
      }
      
      updateDuration() // Update immediately
      const interval = setInterval(updateDuration, 1000) // Then every second

      return () => clearInterval(interval)
    }
  }, [isCheckedIn, checkInTime])

  // Filter attendance history
  const filteredHistory = attendanceHistory.filter(record => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        format(record.date, "MMM d, yyyy").toLowerCase().includes(query) ||
        record.location.toLowerCase().includes(query) ||
        record.method.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Generate calendar data
  const generateCalendarData = () => {
    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })
    
    return days.map(day => {
      const record = attendanceHistory.find(r => isSameDay(r.date, day))
      return {
        date: day,
        hasAttendance: !!record,
        record
      }
    })
  }

  const calendarData = generateCalendarData()

  const lastVisit = attendanceHistory[0]?.date || null

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Attendance" }]} />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Check-in & Attendance</h1>
            <p className="text-muted-foreground text-base">
              Track your hub visits and engagement with the innovation community.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => {
              // In real app, this would generate and download a report
              toast.success("Report downloaded", "Your attendance report has been generated")
            }}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{thisWeek.length}</div>
                  <p className="text-xs text-muted-foreground">Check-ins</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{thisMonth.length}</div>
                  <p className="text-xs text-muted-foreground">Total visits</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{currentStreak}</div>
                  <p className="text-xs text-muted-foreground">Days in a row</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{Math.round(totalHours)}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Check-in Card */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Quick Check-in</CardTitle>
                  <CardDescription>Start or end your session</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className={`flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed py-8 transition-all ${
                      isCheckedIn
                        ? "border-primary bg-primary/5"
                        : "border-border/50"
                    }`}
                  >
                    <div
                      className={`rounded-full p-4 transition-all ${
                        isCheckedIn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-primary"
                      }`}
                    >
                      {isCheckedIn ? (
                        <CheckCircle2 className="h-10 w-10" />
                      ) : (
                        <Clock className="h-10 w-10" />
                      )}
                    </div>
                    <div className="text-center space-y-2">
                      <p className="font-medium text-base">
                        {isCheckedIn ? "You are checked in" : "You are not checked in"}
                      </p>
                      {isCheckedIn && checkInTime ? (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Checked in: {format(checkInTime, "h:mm a")}
                          </p>
                          <p className="text-2xl font-semibold text-primary">{currentDuration}</p>
                          <p className="text-xs text-muted-foreground">Time elapsed</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {lastVisit && (
                            <p className="text-sm text-muted-foreground">
                              Last visit: {format(lastVisit, "MMM d, yyyy")}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">Ready to check in</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-full max-w-[200px]">
                      {!isCheckedIn ? (
                        <>
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={handleQRCheckIn}
                          >
                            <QrCode className="mr-2 h-5 w-5" />
                            Scan QR Code
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            size="lg"
                            onClick={() => handleCheckIn("manual")}
                          >
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Manual Check-in
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="w-full"
                          size="lg"
                          variant="destructive"
                          onClick={() => handleCheckIn("manual")}
                        >
                          <LogOut className="mr-2 h-5 w-5" />
                          Check Out
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Currently Checked In */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Currently Here
                  </CardTitle>
                  <CardDescription>{currentlyCheckedIn.length} members at the hub</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentlyCheckedIn.map((member, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">Since {member.checkedInAt}</p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          <Zap className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    View All Members
                  </Button>
                </CardContent>
              </Card>

              {/* Weekly Calendar */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    This Week
                  </CardTitle>
                  <CardDescription>Your attendance pattern</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {calendarData.map((day, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <p className="text-xs text-muted-foreground font-medium">
                          {format(day.date, "EEE")}
                        </p>
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                            day.hasAttendance
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {format(day.date, "d")}
                        </div>
                        {day.hasAttendance && (
                          <div className="h-1 w-1 rounded-full bg-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-primary" />
                      <span className="text-muted-foreground">Checked in</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-muted" />
                      <span className="text-muted-foreground">No check-in</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest check-ins and check-outs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceHistory.slice(0, 5).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-muted p-2">
                          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {format(record.date, "EEEE, MMM d, yyyy")}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-muted-foreground">
                              {record.timeIn} - {record.timeOut}
                            </p>
                            <span className="text-xs text-muted-foreground">•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{record.location}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">•</span>
                            <Badge variant="outline" className="text-xs">
                              {record.method}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="font-medium">
                          {record.duration}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>View and filter your check-in records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by date, location, or method..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">No records found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchQuery ? "Try adjusting your search filters" : "Start checking in to see your history here"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHistory.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="rounded-lg bg-muted p-2">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {format(record.date, "EEEE, MMM d, yyyy")}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-muted-foreground">
                                {record.timeIn} - {record.timeOut}
                              </p>
                              <span className="text-xs text-muted-foreground">•</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{record.location}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">•</span>
                              <Badge variant="outline" className="text-xs">
                                {record.method}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="font-medium">
                            {record.duration}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Attendance Trends
                  </CardTitle>
                  <CardDescription>Your check-in patterns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average per week</span>
                      <span className="text-lg font-semibold">{Math.round(thisWeek.length)} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average duration</span>
                      <span className="text-lg font-semibold">8h 15m</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Most active day</span>
                      <span className="text-lg font-semibold">Monday</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                  <CardDescription>Your attendance milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Flame className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Current Streak</p>
                          <p className="text-xs text-muted-foreground">{currentStreak} days in a row</p>
                        </div>
                      </div>
                      <Badge className="bg-primary text-primary-foreground">{currentStreak}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Longest Streak</p>
                          <p className="text-xs text-muted-foreground">Your best record</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{longestStreak}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Total Visits</p>
                          <p className="text-xs text-muted-foreground">All time</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{attendanceHistory.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
